import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError, z } from "zod";
import { getClientIp } from "@/hooks/common";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasPermission } from "@/modules/auth/permissions";
import { createActivityLog } from "../setting/audit-logs/hooks/audit-logs.logger";
import { getPatientsPageModel } from "./patients.model";
import {
  countNewPatientsSince,
  countPatients,
  countUpdatedPatientsSince,
  createPatient,
  createPatientWithPortalUser,
  deletePatient,
  findDoctorOptions,
  findPatients,
  updatePatient,
} from "./patients.repository";
import type { ActionState, PatientsPageSearchParams } from "./patients.types";
import { createPatientSchema, updatePatientSchema } from "./patients.validation";

const PATIENTS_PATH = "/patients/view";
const ipAddress = await getClientIp();

const portalUserSchema = z.object({
  email: z.string().trim().email("Enter a valid portal email."),
  emailVerified: z.coerce.boolean().default(false),
  name: z.string().trim().min(2, "Portal user name is required."),
  password: z.string().min(8, "Portal password must be at least 8 characters."),
});

async function requirePatientsPermission(
  permission: "patients.view" | "patients.create" | "patients.edit" | "patients.delete",
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && !hasPermission(user.permissions, permission)) {
    redirect("/dashboard");
  }

  return user;
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();

  return stringValue.length > 0 ? stringValue : undefined;
}
function parsePatientForm(formData: FormData) {
  return {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: emptyToUndefined(formData.get("email")),
    phone: formData.get("phone"),
    dateOfBirth: formData.get("dateOfBirth"),
    age: emptyToUndefined(formData.get("age")),
    gender: formData.get("gender"),
    bloodGroup: emptyToUndefined(formData.get("bloodGroup")),
    doctorAssigned: emptyToUndefined(formData.get("doctorAssigned")),
    admissionDate: formData.get("admissionDate"),
    dischargeDate: emptyToUndefined(formData.get("dischargeDate")),
    status: formData.get("status"),
    address: emptyToUndefined(formData.get("address")),
    allergies: emptyToUndefined(formData.get("allergies")),
    medicalHistory: emptyToUndefined(formData.get("medicalHistory")),
    insuranceProvider: emptyToUndefined(formData.get("insuranceProvider")),
    insurancePolicyNumber: emptyToUndefined(formData.get("insurancePolicyNumber")),
    insuranceMemberId: emptyToUndefined(formData.get("insuranceMemberId")),
    insuranceGroupNumber: emptyToUndefined(formData.get("insuranceGroupNumber")),
    portalLoginEnabled: formData.get("portalLoginEnabled") === "on",
  };
}

function parsePortalUserForm(formData: FormData, patient: ReturnType<typeof parsePatientForm>) {
  if (formData.get("portalLoginEnabled") !== "on") {
    return undefined;
  }

  const fullName =
    `${String(patient.firstName ?? "").trim()} ${String(patient.lastName ?? "").trim()}`.trim();

  return portalUserSchema.parse({
    email: emptyToUndefined(formData.get("portalEmail")) ?? patient.email,
    emailVerified: formData.get("portalEmailVerified") === "on",
    name: emptyToUndefined(formData.get("portalName")) ?? fullName,
    password: formData.get("portalPassword"),
  });
}

function parseUpdatePatientForm(formData: FormData) {
  return {
    id: String(formData.get("id") ?? "").trim(),
    version: Number(formData.get("version") ?? 0),
    ...parsePatientForm(formData),
  };
}

function getUserDisplayName(user: {
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
}) {
  return user.name ?? user.fullName ?? user.email ?? "Unknown user";
}

function getActionError(error: unknown, fallback: string): ActionState {
  if (error instanceof ZodError) {
    console.error("Validation error:", error.issues);

    return {
      ok: false,
      message: error.issues[0]?.message ?? "Please check the patient details and try again.",
    };
  }

  if (
    error instanceof Error &&
    (error.message.includes("duplicate key") || error.message.includes("unique"))
  ) {
    return {
      ok: false,
      message: "A patient or portal user with these details already exists.",
    };
  }

  console.error("Action error:", error);

  return { ok: false, message: fallback };
}

export async function getPatientsPageData(searchParams: Promise<PatientsPageSearchParams>) {
  await requirePatientsPermission("patients.view");
  const { created, q } = await searchParams;
  const query = q?.trim() ?? "";
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [patients, totalPatients, newThisWeek, recentlyUpdated] = await Promise.all([
    findPatients({ query }),
    countPatients(query),
    countNewPatientsSince(sevenDaysAgo),
    countUpdatedPatientsSince(sevenDaysAgo),
  ]);

  return getPatientsPageModel({
    created: created === "1",
    patients,
    query,
    stats: {
      totalPatients,
      newThisWeek,
      recentlyUpdated,
    },
  });
}

export async function getDoctorAssignedOptions() {
  await requirePatientsPermission("patients.create");

  return findDoctorOptions();
}

export async function createPatientFromForm(formData: FormData): Promise<ActionState> {
  const user = await requirePatientsPermission("patients.create");
  try {
    const input = createPatientSchema.parse(parsePatientForm(formData));
    const patient = await createPatient(input);
    if (!patient) {
      return {
        ok: false,
        message: "Unable to create patient.",
      };
    }
    await createActivityLog({
      action: "CREATE_PATIENT",
      module: "patients",
      description: `Created patient ${patient.fullName}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress,
      metadata: {
        patientId: patient.id,
        patientName: patient.fullName,
      },
    });
    revalidatePath(PATIENTS_PATH);
    return { ok: true, message: "Patient created successfully." };
  } catch (error) {
    return getActionError(error, "Unable to create patient. Please try again.");
  }
}

export async function createPatientWithPortalFromForm(formData: FormData): Promise<ActionState> {
  const user = await requirePatientsPermission("patients.create");

  try {
    const rawPatient = parsePatientForm(formData);
    const input = createPatientSchema.parse(rawPatient);
    const portalUser = parsePortalUserForm(formData, rawPatient);
    const patient = await createPatientWithPortalUser(
      input,
      portalUser
        ? {
            email: portalUser.email,
            emailVerified: portalUser.emailVerified,
            firstName: input.firstName,
            lastName: input.lastName,
            name: portalUser.name,
            passwordHash: await bcrypt.hash(portalUser.password, 10),
            phone: input.phone,
          }
        : undefined,
    );

    if (!patient) {
      return {
        ok: false,
        message: "Unable to create patient.",
      };
    }

    await createActivityLog({
      action: "CREATE_PATIENT",
      module: "patients",
      description: `Created patient ${patient.fullName}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress,
      metadata: {
        patientId: patient.id,
        patientName: patient.fullName,
        portalLoginEnabled: input.portalLoginEnabled,
      },
    });

    revalidatePath(PATIENTS_PATH);
    revalidatePath("/patients/add-patient");

    return {
      ok: true,
      message: portalUser
        ? "Patient and portal user created successfully."
        : "Patient created successfully.",
    };
  } catch (error) {
    return getActionError(error, "Unable to create patient. Please try again.");
  }
}

export async function updatePatientFromForm(formData: FormData): Promise<ActionState> {
  const user = await requirePatientsPermission("patients.edit");

  try {
    const rawData = parseUpdatePatientForm(formData);
    if (!rawData.id) {
      return {
        ok: false,
        message: "Patient id is missing.",
      };
    }

    const input = updatePatientSchema.parse(rawData);
    const { id, version, ...updateInput } = input;
    const patient = await updatePatient(id, updateInput);
    if (!patient) {
      return {
        ok: false,
        message: "Patient not found.",
      };
    }

    await createActivityLog({
      action: "UPDATE_PATIENT",
      module: "patients",
      description: `Updated patient ${patient.fullName}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress,
      metadata: {
        patientId: patient.id,
        patientName: patient.fullName,
        version,
      },
    });

    revalidatePath(PATIENTS_PATH);
    return {
      ok: true,
      message: "Patient updated successfully.",
    };
  } catch (error) {
    return getActionError(error, "Unable to update patient. Please try again.");
  }
}

export async function deletePatientFromForm(formData: FormData): Promise<ActionState> {
  const user = await requirePatientsPermission("patients.delete");
  try {
    const id = String(formData.get("id") ?? "").trim();
    if (!id) {
      return { ok: false, message: "Patient id is missing." };
    }
    const patient = await deletePatient(id);
    if (!patient) {
      return { ok: false, message: "Patient not found." };
    }
    await createActivityLog({
      action: "DELETE_PATIENT",
      module: "patients",
      description: `Deleted patient ${id}`,
      userId: user.id,
      ipAddress,
      userName: getUserDisplayName(user),
      metadata: {
        patientId: id,
      },
    });
    revalidatePath(PATIENTS_PATH);
    return { ok: true, message: "Patient deleted successfully." };
  } catch (error) {
    return getActionError(error, "Unable to delete patient. Please try again.");
  }
}

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getClientIp } from "@/hooks/common";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasPermission } from "@/modules/auth/permissions";
import { createActivityLog } from "@/modules/setting/audit-logs/hooks/audit-logs.logger";
import { getAddDoctorPageModel, getDoctorsPageModel } from "./doctors.model";
import {
  countAvailableDoctors,
  countDoctorDepartments,
  countDoctors,
  createDoctor,
  findDoctorBranchOptions,
  findDoctorDepartmentOptions,
  findDoctorRoleId,
  findDoctors,
} from "./doctors.repository";
import type { ActionState, DoctorsPageSearchParams } from "./doctors.types";
import { createDoctorSchema } from "./doctors.validation";

const DOCTORS_PATH = "/doctors/view";

async function requireDoctorsPermission(permission: "doctors.view" | "doctors.create") {
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

function parseDoctorForm(formData: FormData) {
  const portalLoginEnabled = formData.get("portalLoginEnabled") === "on";

  return {
    name: formData.get("portalName"),
    email: formData.get("portalEmail"),
    password: formData.get("portalPassword"),
    emailVerified: formData.get("portalEmailVerified") === "on",
    portalLoginEnabled,
    image: emptyToUndefined(formData.get("image")),
    firstName: emptyToUndefined(formData.get("firstName")),
    lastName: emptyToUndefined(formData.get("lastName")),
    phone: emptyToUndefined(formData.get("phone")),
    gender: emptyToUndefined(formData.get("gender")),
    dateOfBirth: emptyToUndefined(formData.get("dateOfBirth")),
    address: emptyToUndefined(formData.get("address")),
    city: emptyToUndefined(formData.get("city")),
    state: emptyToUndefined(formData.get("state")),
    country: emptyToUndefined(formData.get("country")),
    postalCode: emptyToUndefined(formData.get("postalCode")),
    departmentId: formData.get("departmentId"),
    branchId: emptyToUndefined(formData.get("branchId")),
    specialization: formData.get("specialization"),
    qualification: emptyToUndefined(formData.get("qualification")),
    experienceYears: emptyToUndefined(formData.get("experienceYears")),
    consultationFee: emptyToUndefined(formData.get("consultationFee")),
    licenseNumber: emptyToUndefined(formData.get("licenseNumber")),
    bio: emptyToUndefined(formData.get("bio")),
    isAvailable: formData.get("isAvailable") === "on" || formData.get("isAvailable") === "true",
  };
}

function getUserDisplayName(user: { name?: string | null; email?: string | null }) {
  return user.name ?? user.email ?? "Unknown user";
}

function getActionError(error: unknown, fallback: string): ActionState {
  if (error instanceof ZodError) {
    return {
      ok: false,
      message: error.issues[0]?.message ?? "Please check the doctor details and try again.",
    };
  }

  if (
    error instanceof Error &&
    (error.message.includes("duplicate key") || error.message.includes("unique"))
  ) {
    return {
      ok: false,
      message: "A user or doctor with these details already exists.",
    };
  }

  console.error("Doctor action error:", error);

  return { ok: false, message: fallback };
}

export async function getDoctorsPageData(searchParams: Promise<DoctorsPageSearchParams>) {
  await requireDoctorsPermission("doctors.view");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const [doctors, totalDoctors, availableDoctors, departments] = await Promise.all([
    findDoctors({ query }),
    countDoctors(query),
    countAvailableDoctors(),
    countDoctorDepartments(),
  ]);

  return getDoctorsPageModel({
    doctors,
    query,
    stats: {
      totalDoctors,
      availableDoctors,
      departments,
    },
  });
}

export async function getAddDoctorPageData() {
  await requireDoctorsPermission("doctors.create");

  const [departments, branches] = await Promise.all([
    findDoctorDepartmentOptions(),
    findDoctorBranchOptions(),
  ]);

  return getAddDoctorPageModel(departments, branches);
}

export async function createDoctorFromForm(formData: FormData): Promise<ActionState> {
  const user = await requireDoctorsPermission("doctors.create");

  try {
    const input = createDoctorSchema.parse(parseDoctorForm(formData));
    const roleId = await findDoctorRoleId();

    if (!roleId) {
      return { ok: false, message: "Doctor role is missing. Seed roles before adding doctors." };
    }

    const doctor = await createDoctor(input, await bcrypt.hash(input.password, 10), roleId);

    if (!doctor) {
      return { ok: false, message: "Unable to create doctor." };
    }

    await createActivityLog({
      action: "CREATE_DOCTOR",
      module: "doctors",
      description: `Created doctor ${doctor.name}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress: await getClientIp(),
      metadata: {
        doctorId: doctor.id,
        doctorName: doctor.name,
        userId: doctor.userId,
      },
    });

    revalidatePath(DOCTORS_PATH, "page");
    return { ok: true, message: "Doctor created successfully." };
  } catch (error) {
    return getActionError(error, "Unable to create doctor. Please try again.");
  }
}

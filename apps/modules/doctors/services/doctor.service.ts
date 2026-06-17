import { desc, eq } from "drizzle-orm";
import { hashPassword } from "@mediclinic/auth";
import {
  db,
  departments,
  doctorAvailabilitySlots,
  doctorLeaveDates,
  doctorSchedules,
  doctorSpecialties,
  doctors,
  roles,
  users
} from "@mediclinic/db";

import { sendNotification } from "@modules/settings/notifications/services/notification-sender.service";

export type DoctorRecord = {
  id: string;
  userId: string;
  name: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  departmentId: string | null;
  departmentName: string | null;
  specialtyId: string | null;
  specialtyName: string | null;
  qualification: string | null;
  experienceYears: number | null;
  licenseNumber: string | null;
  consultationFee: string;
  bio: string | null;
  isAvailable: boolean;
  status: "active" | "inactive" | "blocked";
};

export type DoctorInput = {
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  password?: string | null;
  departmentId?: string | null;
  specialtyId?: string | null;
  qualification?: string | null;
  experienceYears?: number | null;
  licenseNumber?: string | null;
  consultationFee: string;
  bio?: string | null;
  status: "active" | "inactive" | "blocked";
  isAvailable: boolean;
  initialSchedules?: ScheduleInput[] | null;
};

export type ScheduleInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
};

export type LeaveInput = {
  leaveDate: string;
  reason?: string | null;
  isFullDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
};

function nameOf(user: { firstName: string; lastName: string | null }) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

/* ---------------- ROLE HELPERS (NEW SYSTEM) ---------------- */

async function getDoctorRoleId() {
  const [role] = await db
    .select()
    .from(roles)
    .where(eq(roles.code, "doctor"))
    .limit(1);

  if (!role) throw new Error("Doctor role does not exist");
  return role.id;
}

/* ---------------- SLOT GENERATION ---------------- */

function generateSlots(
  slotDate: string,
  startTime: string,
  endTime: string,
  duration: number
) {
  const slots: Array<{ slotDate: string; startTime: string; endTime: string }> = [];

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const cursor = new Date(
    `${slotDate}T${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}:00`
  );

  const end = new Date(
    `${slotDate}T${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`
  );

  while (cursor < end) {
    const next = new Date(cursor.getTime() + duration * 60_000);
    if (next > end) break;

    slots.push({
      slotDate,
      startTime: cursor.toTimeString().slice(0, 5),
      endTime: next.toTimeString().slice(0, 5)
    });

    cursor.setTime(next.getTime());
  }

  return slots;
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function generateTemporaryPassword() {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$";

  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);

  return Array.from(
    bytes,
    (byte) => alphabet[byte % alphabet.length]
  ).join("");
}

/* ---------------- SERVICE ---------------- */

export const doctorService = {
  async listSpecialties() {
    return db.select().from(doctorSpecialties).orderBy(doctorSpecialties.name);
  },

  async listDepartments() {
    return db.select().from(departments).orderBy(departments.name);
  },

  async list(): Promise<DoctorRecord[]> {
    const rows = await db
      .select({
        doctor: doctors,
        user: users,
        department: departments,
        specialty: doctorSpecialties
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .leftJoin(doctorSpecialties, eq(doctors.specialtyId, doctorSpecialties.id))
      .orderBy(desc(doctors.createdAt));

    return rows.map(({ doctor, user, department, specialty }) => ({
      id: doctor.id,
      userId: user.id,
      name: nameOf(user),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      departmentId: doctor.departmentId,
      departmentName: department?.name ?? null,
      specialtyId: doctor.specialtyId,
      specialtyName: specialty?.name ?? null,
      qualification: doctor.qualification,
      experienceYears: doctor.experienceYears,
      licenseNumber: doctor.licenseNumber,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio,
      isAvailable: doctor.isAvailable,
      status: user.status
    }));
  },

  async get(id: string) {
    return (await this.list()).find((d) => d.id === id) ?? null;
  },

  /* ---------------- CREATE ---------------- */

  async create(input: DoctorInput) {
    const temporaryPassword = input.password || generateTemporaryPassword();
    const doctorRoleId = await getDoctorRoleId();

    const [user] = await db
      .insert(users)
      .values({
        firstName: input.firstName,
        lastName: input.lastName || null,
        username: `${input.firstName.toLowerCase().replace(/\s+/g, "")}${
          input.lastName
            ? "." + input.lastName.toLowerCase().replace(/\s+/g, "")
            : ""
        }`,
        email: input.email.toLowerCase(),
        phone: input.phone || null,
        passwordHash: await hashPassword(temporaryPassword),
        status: input.status,
        emailVerified: true,
        roleId: doctorRoleId
      })
      .returning();

    const [doctor] = await db
      .insert(doctors)
      .values({
        userId: user.id,
        departmentId: input.departmentId || null,
        specialtyId: input.specialtyId || null,
        qualification: input.qualification || null,
        experienceYears: input.experienceYears ?? null,
        licenseNumber: input.licenseNumber || null,
        consultationFee: input.consultationFee,
        bio: input.bio || null,
        isAvailable: input.isAvailable
      })
      .returning();

    if (input.initialSchedules?.length) {
      await db.insert(doctorSchedules).values(
        input.initialSchedules.map((s) => ({
          doctorId: doctor.id,
          ...s
        }))
      );

      await this.generateAvailability(doctor.id);
    }

    sendNotification({
      templateCode: "doctor_welcome",
      recipient: input.email,
      variables: {
        doctor_name: `${input.firstName} ${input.lastName || ""}`.trim(),
        doctor_email: input.email,
        temporary_password: temporaryPassword,
        portal_url:
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        clinic_name:
          process.env.NEXT_PUBLIC_APP_NAME || "MediClinic Pro"
      },
      userId: user.id
    }).catch(console.error);

    return { doctorId: doctor.id, temporaryPassword };
  },

  /* ---------------- UPDATE ---------------- */

  async update(id: string, input: DoctorInput) {
    const doctor = await this.get(id);
    if (!doctor) throw new Error("Doctor not found");

    await db
      .update(users)
      .set({
        firstName: input.firstName,
        lastName: input.lastName || null,
        email: input.email.toLowerCase(),
        phone: input.phone || null,
        status: input.status
      })
      .where(eq(users.id, doctor.userId));

    await db
      .update(doctors)
      .set({
        departmentId: input.departmentId || null,
        specialtyId: input.specialtyId || null,
        qualification: input.qualification || null,
        experienceYears: input.experienceYears ?? null,
        licenseNumber: input.licenseNumber || null,
        consultationFee: input.consultationFee,
        bio: input.bio || null,
        isAvailable: input.isAvailable
      })
      .where(eq(doctors.id, id));

    sendNotification({
      templateCode: "doctor_profile_updated",
      recipient: input.email,
      variables: {
        doctor_name: `${input.firstName} ${input.lastName || ""}`.trim(),
        clinic_name:
          process.env.NEXT_PUBLIC_APP_NAME || "MediClinic Pro"
      },
      userId: doctor.userId
    }).catch(() => {});
  },

  /* ---------------- DEACTIVATE ---------------- */

  async deactivate(id: string) {
    const doctor = await this.get(id);
    if (!doctor) throw new Error("Doctor not found");

    await db
      .update(users)
      .set({ status: "inactive" })
      .where(eq(users.id, doctor.userId));

    await db
      .update(doctors)
      .set({ isAvailable: false })
      .where(eq(doctors.id, id));

    sendNotification({
      templateCode: "doctor_deactivated",
      recipient: doctor.email,
      variables: {
        doctor_name: doctor.name,
        clinic_name:
          process.env.NEXT_PUBLIC_APP_NAME || "MediClinic Pro"
      },
      userId: doctor.userId
    }).catch(() => {});
  },

  /* ---------------- SCHEDULES ---------------- */

  async schedules(id: string) {
    return db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.doctorId, id))
      .orderBy(doctorSchedules.dayOfWeek);
  },

  async leaves(id: string) {
    return db
      .select()
      .from(doctorLeaveDates)
      .where(eq(doctorLeaveDates.doctorId, id))
      .orderBy(desc(doctorLeaveDates.leaveDate));
  },

  async slots(id: string) {
    return db
      .select()
      .from(doctorAvailabilitySlots)
      .where(eq(doctorAvailabilitySlots.doctorId, id))
      .orderBy(desc(doctorAvailabilitySlots.slotDate));
  },

  async addSchedule(id: string, input: ScheduleInput) {
    const doctor = await this.get(id);

    await db.insert(doctorSchedules).values({
      doctorId: id,
      ...input
    });

    await this.generateAvailability(id);

    if (doctor) {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];

      sendNotification({
        templateCode: "doctor_schedule_updated",
        recipient: doctor.email,
        variables: {
          doctor_name: doctor.name,
          schedule_day: days[input.dayOfWeek],
          schedule_time: `${input.startTime} - ${input.endTime}`,
          schedule_duration: String(input.slotDurationMinutes),
          clinic_name:
            process.env.NEXT_PUBLIC_APP_NAME || "MediClinic Pro"
        },
        userId: doctor.userId
      }).catch(() => {});
    }
  },

  async addLeave(id: string, input: LeaveInput) {
    const doctor = await this.get(id);

    await db.insert(doctorLeaveDates).values({
      doctorId: id,
      ...input
    });

    await this.generateAvailability(id);

    if (doctor) {
      sendNotification({
        templateCode: "doctor_leave_added",
        recipient: doctor.email,
        variables: {
          doctor_name: doctor.name,
          leave_date: input.leaveDate,
          leave_duration: input.isFullDay
            ? "Full day"
            : `${input.startTime || ""} - ${input.endTime || ""}`.trim(),
          leave_reason: input.reason || "Not specified",
          clinic_name:
            process.env.NEXT_PUBLIC_APP_NAME || "MediClinic Pro"
        },
        userId: doctor.userId
      }).catch(() => {});
    }
  },

  /* ---------------- AVAILABILITY ---------------- */

  async generateAvailability(id: string) {
    const schedules = await this.schedules(id);
    const leaves = await this.leaves(id);

    const leaveDates = new Set(
      leaves
        .filter((l) => l.isFullDay)
        .map((l) => l.leaveDate)
    );

    for (let i = 0; i < 14; i++) {
      const day = addDays(new Date(), i);
      const slotDate = dateKey(day);

      if (leaveDates.has(slotDate)) continue;

      const daySchedules = schedules.filter(
        (s) => s.isActive && s.dayOfWeek === day.getDay()
      );

      for (const schedule of daySchedules) {
        const slots = generateSlots(
          slotDate,
          schedule.startTime,
          schedule.endTime,
          schedule.slotDurationMinutes
        );

        for (const slot of slots) {
          await db
            .insert(doctorAvailabilitySlots)
            .values({
              doctorId: id,
              ...slot
            })
            .onConflictDoNothing();
        }
      }
    }
  }
};
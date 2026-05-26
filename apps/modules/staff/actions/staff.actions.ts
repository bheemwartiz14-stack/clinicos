"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { headers } from "next/headers";
import { requirePagePermission, getSession } from "@/lib/auth";
import { staffService, type StaffRecord } from "../services/staff.service";
import { auditService } from "../services/audit.service";
import { sendNotification, sendSystemNotification } from "@modules/settings/notifications/services/notification-sender.service";

const staffSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().optional().or(z.literal("")),
  username: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email(),
  phone: z.string().trim().optional().or(z.literal("")),
  password: z.string().trim().optional().or(z.literal("")),
  role: z.enum(["admin", "receptionist", "accountant"]),
  departmentId: z.string().trim().optional().or(z.literal("")),
  employeeCode: z.string().trim().optional().or(z.literal("")),
  designation: z.string().trim().optional().or(z.literal("")),
  joiningDate: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  emergencyContact: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "blocked"])
});

export async function createStaffAction(formData: FormData) {
  const session = await requirePagePermission("staff.manage");
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/settings/staff-manage/create?error=invalid" as Route);

  const headerStore = await headers();
  const ipAddress = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";
  const userAgent = headerStore.get("user-agent") ?? undefined;

  await staffService.create(parsed.data);

  const staffName = [parsed.data.firstName, parsed.data.lastName].filter(Boolean).join(" ");
  const departmentName = parsed.data.departmentId
    ? (await staffService.listDepartments()).find((d) => d.id === parsed.data.departmentId)?.name ?? "General"
    : "General";

  await auditService.log({
    userId: session.userId,
    action: "create",
    entity: "staff",
    entityId: staffName,
    newValues: { email: parsed.data.email, role: parsed.data.role, departmentId: parsed.data.departmentId },
    ipAddress,
    userAgent,
  });

  try {
    await sendNotification({
      templateCode: "staff_welcome",
      recipient: parsed.data.email,
      variables: {
        staff_name: staffName,
        staff_email: parsed.data.email,
        staff_role: parsed.data.role,
        staff_department: departmentName,
        temporary_password: parsed.data.password ?? "",
        portal_url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        clinic_name: "MediClinic Pro",
      },
      userId: session.userId,
    });
  } catch {
    // notification send failure is non-critical
  }

  revalidatePath("/settings/staff-manage");
  redirect("/settings/staff-manage" as Route);
}

export async function updateStaffAction(id: string, formData: FormData) {
  const session = await requirePagePermission("staff.manage");
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/settings/staff-manage/${id}/edit?error=invalid` as Route);

  const headerStore = await headers();
  const ipAddress = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";
  const userAgent = headerStore.get("user-agent") ?? undefined;

  const existing = await staffService.get(id);

  await staffService.update(id, parsed.data);

  const staffName = [parsed.data.firstName, parsed.data.lastName].filter(Boolean).join(" ");

  await auditService.log({
    userId: session.userId,
    action: "update",
    entity: "staff",
    entityId: staffName,
    oldValues: existing ? { email: existing.email, role: existing.role, status: existing.status, departmentId: existing.departmentId } : undefined,
    newValues: { email: parsed.data.email, role: parsed.data.role, status: parsed.data.status, departmentId: parsed.data.departmentId },
    ipAddress,
    userAgent,
  });

  if (existing && existing.status !== parsed.data.status) {
    try {
      await sendNotification({
        templateCode: parsed.data.status === "active" ? "staff_activated" : "staff_deactivated",
        recipient: parsed.data.email,
        variables: {
          staff_name: staffName,
          staff_email: parsed.data.email,
          new_status: parsed.data.status,
          portal_url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          clinic_name: "MediClinic Pro",
        },
        userId: session.userId,
      });
    } catch {
      // non-critical
    }

    try {
      await sendSystemNotification({
        userId: session.userId,
        subject: "Staff Status Updated",
        body: `${staffName}'s status has been changed to ${parsed.data.status}.`,
      });
    } catch {
      // non-critical
    }
  }

  revalidatePath("/settings/staff-manage");
  redirect("/settings/staff-manage" as Route);
}

export async function deactivateStaffAction(formData: FormData) {
  const session = await requirePagePermission("staff.manage");
  const id = String(formData.get("id") ?? "");

  const headerStore = await headers();
  const ipAddress = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";
  const userAgent = headerStore.get("user-agent") ?? undefined;

  if (id) {
    const existing = await staffService.get(id);

    await staffService.deactivate(id);

    if (existing) {
      await auditService.log({
        userId: session.userId,
        action: "deactivate",
        entity: "staff",
        entityId: existing.name,
        oldValues: { status: existing.status, isActive: true },
        newValues: { status: "inactive", isActive: false },
        ipAddress,
        userAgent,
      });

      try {
        await sendNotification({
          templateCode: "staff_deactivated",
          recipient: existing.email,
          variables: {
            staff_name: existing.name,
            staff_email: existing.email,
            portal_url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
            clinic_name: "MediClinic Pro",
          },
          userId: session.userId,
        });
      } catch {
        // non-critical
      }

      try {
        await sendSystemNotification({
          userId: session.userId,
          subject: "Staff Deactivated",
          body: `${existing.name} has been deactivated.`,
        });
      } catch {
        // non-critical
      }
    }
  }

  revalidatePath("/settings/staff-manage");
}

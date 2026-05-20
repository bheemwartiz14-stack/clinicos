import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { doctorIntegrations } from "@mediclinic/db";
import type { IntegrationProvider, IntegrationStatus } from "../types/integration.types";

export async function listDoctorIntegrations(doctorId: string) {
  return db.select().from(doctorIntegrations).where(eq(doctorIntegrations.doctorId, doctorId));
}

export async function getDoctorIntegration(doctorId: string, provider: IntegrationProvider) {
  const [integration] = await db
    .select()
    .from(doctorIntegrations)
    .where(and(eq(doctorIntegrations.doctorId, doctorId), eq(doctorIntegrations.provider, provider)))
    .limit(1);

  return integration ?? null;
}

export async function upsertDoctorIntegration(input: {
  doctorId: string;
  userId: string;
  provider: IntegrationProvider;
  providerAccountEmail: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  scope?: string | null;
  expiryDate?: Date | null;
  calendarId?: string;
  status: IntegrationStatus;
  isEnabled: boolean;
  metadata?: Record<string, unknown>;
}) {
  const existing = await getDoctorIntegration(input.doctorId, input.provider);
  const values = {
    userId: input.userId,
    providerAccountEmail: input.providerAccountEmail,
    accessToken: input.accessToken ?? null,
    refreshToken: input.refreshToken ?? null,
    tokenType: input.tokenType ?? null,
    scope: input.scope ?? null,
    expiryDate: input.expiryDate ?? null,
    calendarId: input.calendarId ?? "primary",
    status: input.status,
    isEnabled: input.isEnabled,
    errorMessage: null,
    metadata: input.metadata ?? {},
    updatedAt: new Date()
  };

  if (existing) {
    const [updated] = await db
      .update(doctorIntegrations)
      .set(values as any)
      .where(eq(doctorIntegrations.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(doctorIntegrations)
    .values({
      doctorId: input.doctorId,
      provider: input.provider,
      ...values
    } as any)
    .returning();
  return created;
}

export async function updateDoctorIntegration(id: string, data: Partial<{
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  scope: string | null;
  expiryDate: Date | null;
  calendarId: string;
  status: IntegrationStatus;
  isEnabled: boolean;
  lastSyncedAt: Date | null;
  lastTestedAt: Date | null;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
}>) {
  const [updated] = await db
    .update(doctorIntegrations)
    .set({ ...data, updatedAt: new Date() } as any)
    .where(eq(doctorIntegrations.id, id))
    .returning();
  return updated;
}

export async function disconnectDoctorIntegration(doctorId: string, provider: IntegrationProvider) {
  const integration = await getDoctorIntegration(doctorId, provider);
  if (!integration) return null;
  return updateDoctorIntegration(integration.id, {
    accessToken: null,
    refreshToken: null,
    status: "disconnected",
    isEnabled: false,
    errorMessage: null
  });
}

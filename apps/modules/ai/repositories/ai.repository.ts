import { db } from "@/lib/db";
import { aiAuditLogs, aiRecommendations } from "@mediclinic/db";

export async function createAiAuditLog(input: {
  branchId?: string | null;
  userId?: string | null;
  patientId?: string | null;
  promptKey: string;
  action: string;
  inputHash?: string | null;
  outputSummary?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const [log] = await db
    .insert(aiAuditLogs)
    .values({
      branchId: input.branchId ?? null,
      userId: input.userId ?? null,
      patientId: input.patientId ?? null,
      promptKey: input.promptKey,
      action: input.action,
      inputHash: input.inputHash ?? null,
      outputSummary: input.outputSummary ?? null,
      metadata: input.metadata ?? {}
    } as any)
    .returning();

  return log;
}

export async function createAiRecommendation(input: {
  branchId: string;
  patientId?: string | null;
  doctorId?: string | null;
  recommendationType: string;
  title: string;
  body: string;
  confidence?: number | null;
  metadata?: Record<string, unknown>;
  expiresAt?: Date | null;
}) {
  const [recommendation] = await db
    .insert(aiRecommendations)
    .values({
      branchId: input.branchId,
      patientId: input.patientId ?? null,
      doctorId: input.doctorId ?? null,
      recommendationType: input.recommendationType,
      title: input.title,
      body: input.body,
      status: "pending",
      confidence: input.confidence?.toFixed(4) ?? null,
      metadata: input.metadata ?? {},
      expiresAt: input.expiresAt ?? null
    } as any)
    .returning();

  return recommendation;
}

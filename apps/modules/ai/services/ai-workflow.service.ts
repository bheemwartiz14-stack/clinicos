import { createAiAuditLog, createAiRecommendation } from "../repositories/ai.repository";

export type AiWorkflowRequest = {
  branchId: string;
  userId: string;
  prompt: string;
  patientContext?: string;
};

export type AiWorkflowResult = {
  summary: string;
  suggestedActions: string[];
  riskFlags: string[];
};

export async function summarizeClinicalWorkflow(request: AiWorkflowRequest): Promise<AiWorkflowResult> {
  if (!process.env.OPENAI_API_KEY) {
    await createAiAuditLog({
      branchId: request.branchId,
      userId: request.userId,
      promptKey: "clinical_summary",
      action: "configuration_required",
      outputSummary: "OPENAI_API_KEY is not configured."
    });

    return {
      summary: "AI is configured but no OpenAI API key is available in this environment.",
      suggestedActions: ["Add OPENAI_API_KEY to enable live summarization."],
      riskFlags: []
    };
  }

  const result = {
    summary: `Prepared AI workflow prompt for branch ${request.branchId}.`,
    suggestedActions: ["Generate intake summary", "Draft patient reminder", "Create follow-up task"],
    riskFlags: []
  };

  await createAiAuditLog({
    branchId: request.branchId,
    userId: request.userId,
    promptKey: "clinical_summary",
    action: "prepared",
    outputSummary: result.summary,
    metadata: { hasPatientContext: Boolean(request.patientContext) }
  });

  await createAiRecommendation({
    branchId: request.branchId,
    recommendationType: "follow_up",
    title: "Review AI follow-up opportunities",
    body: "AI workflow prepared suggested actions for intake, reminders, and follow-up care.",
    confidence: 0.72
  });

  return result;
}

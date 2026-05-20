import { z } from "zod";

export const integrationProviderSchema = z.enum(["google_calendar", "google_meet"]);

export const connectIntegrationSchema = z.object({
  doctorId: z.string().uuid().optional(),
  provider: integrationProviderSchema
});

export const disconnectIntegrationSchema = z.object({
  doctorId: z.string().uuid().optional(),
  provider: integrationProviderSchema
});

export const appointmentConsultationModeSchema = z.object({
  consultationMode: z.enum(["offline", "online", "hybrid"]),
  locationType: z.enum(["clinic", "online"]).default("clinic"),
  roomId: z.string().uuid().optional().nullable()
}).superRefine((value, ctx) => {
  if (value.consultationMode === "offline" && value.locationType !== "clinic") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["locationType"], message: "Offline appointments must use a clinic location." });
  }
  if (value.consultationMode === "online" && value.locationType !== "online") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["locationType"], message: "Online appointments must use an online location." });
  }
});

export type ConnectIntegrationInput = z.infer<typeof connectIntegrationSchema>;
export type DisconnectIntegrationInput = z.infer<typeof disconnectIntegrationSchema>;
export type AppointmentConsultationModeInput = z.infer<typeof appointmentConsultationModeSchema>;

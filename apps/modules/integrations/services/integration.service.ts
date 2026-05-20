import { can, type Role } from "@mediclinic/rbac";
import { doctorService } from "@modules/doctors/services/doctor.service";
import { disconnectDoctorIntegration, getDoctorIntegration, listDoctorIntegrations, upsertDoctorIntegration } from "../repositories/integration.repository";
import { exchangeGoogleCode, getGoogleAccountEmail, parseGoogleState } from "../utils/google-oauth";
import { encryptToken } from "../utils/google-token-encryption";
import type { IntegrationProvider } from "../types/integration.types";

export async function resolveDoctorForIntegration(input: {
  sessionUserId: string;
  role: Role;
  doctorId?: string | null;
  manage?: boolean;
}) {
  if (input.role === "admin" && input.doctorId) {
    const doctor = await doctorService.getById(input.doctorId);
    if (!doctor) throw new Error("Doctor not found.");
    return doctor;
  }

  const doctor = await doctorService.getByUserId(input.sessionUserId);
  if (!doctor) throw new Error("Doctor profile not found.");

  if (input.doctorId && input.doctorId !== doctor.id && input.role !== "admin") {
    throw new Error("You can only access your own integrations.");
  }

  if (input.manage && !can(input.role, "integrations.manage") && input.role !== "doctor") {
    throw new Error("You do not have permission to manage integrations.");
  }

  return doctor;
}

export const integrationService = {
  list(doctorId: string) {
    return listDoctorIntegrations(doctorId);
  },

  get(doctorId: string, provider: IntegrationProvider) {
    return getDoctorIntegration(doctorId, provider);
  },

  async completeGoogleOAuth(code: string, state: string | null, sessionUserId: string) {
    const parsedState = parseGoogleState(state);
    if (parsedState.userId !== sessionUserId) throw new Error("Invalid OAuth session.");

    const tokens = await exchangeGoogleCode(parsedState.provider, code);
    const email = await getGoogleAccountEmail(tokens.access_token);
    const existing = await getDoctorIntegration(parsedState.doctorId, parsedState.provider);

    return upsertDoctorIntegration({
      doctorId: parsedState.doctorId,
      userId: parsedState.userId,
      provider: parsedState.provider,
      providerAccountEmail: email,
      accessToken: encryptToken(tokens.access_token),
      refreshToken: encryptToken(tokens.refresh_token ?? existing?.refreshToken ?? null),
      tokenType: tokens.token_type ?? existing?.tokenType ?? null,
      scope: tokens.scope ?? existing?.scope ?? null,
      expiryDate: new Date(Date.now() + tokens.expires_in * 1000),
      calendarId: existing?.calendarId ?? "primary",
      status: "connected",
      isEnabled: true,
      metadata: { connectedAt: new Date().toISOString() }
    });
  },

  disconnect(doctorId: string, provider: IntegrationProvider) {
    return disconnectDoctorIntegration(doctorId, provider);
  }
};

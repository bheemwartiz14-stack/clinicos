import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { can } from "@mediclinic/rbac";
import { getSession } from "@/lib/auth";
import { buildGoogleAuthUrl } from "../utils/google-oauth";
import { integrationService, resolveDoctorForIntegration } from "../services/integration.service";
import type { IntegrationProvider } from "../types/integration.types";

function providerTab(provider: IntegrationProvider) {
  return provider;
}

function integrationSettingsError(provider: IntegrationProvider, error: string) {
  return `/settings/integration?tab=${providerTab(provider)}&error=${encodeURIComponent(error)}`;
}

function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();

  if (forwardedHost) {
    return `${forwardedProto || url.protocol.replace(":", "")}://${forwardedHost}`;
  }

  return url.origin;
}

export async function connectIntegrationController(provider: IntegrationProvider, request: Request) {
  try {
    const session = await getSession();
    if (!session) redirect("/login");
    if (!can(session.role, "integrations.manage") && session.role !== "doctor") {
      return new Response("Forbidden", { status: 403 });
    }

    const doctor = await resolveDoctorForIntegration({ sessionUserId: session.userId, role: session.role, manage: true });
    redirect(buildGoogleAuthUrl({ provider, doctorId: doctor.id, userId: session.userId, origin: requestOrigin(request) }) as any);
  } catch (error) {
    if (error instanceof Error && error.message.includes("GOOGLE_CLIENT_ID")) {
      redirect(integrationSettingsError(provider, "oauth_not_configured") as any);
    }
    if (error instanceof Error && error.message.includes("Doctor profile")) {
      redirect(integrationSettingsError(provider, "doctor_profile_missing") as any);
    }
    throw error;
  }
}

export async function callbackIntegrationController(provider: IntegrationProvider, request: Request) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  if (error) redirect(integrationSettingsError(provider, "access_denied") as any);

  const code = searchParams.get("code");
  if (!code) redirect(integrationSettingsError(provider, "missing_code") as any);

  try {
    await integrationService.completeGoogleOAuth(code, searchParams.get("state"), session.userId, requestOrigin(request));
  } catch (caught) {
    console.error("Integration callback failed:", caught);
    redirect(integrationSettingsError(provider, "callback_failed") as any);
  }
  redirect(`/settings/integration?tab=${provider}&success=connected` as any);
}

export async function disconnectIntegrationController(provider: IntegrationProvider, request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "integrations.manage") && session.role !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const doctor = await resolveDoctorForIntegration({ sessionUserId: session.userId, role: session.role, doctorId: body.doctorId, manage: true });
  await integrationService.disconnect(doctor.id, provider);
  return NextResponse.json({ success: true, message: "Integration disconnected." });
}

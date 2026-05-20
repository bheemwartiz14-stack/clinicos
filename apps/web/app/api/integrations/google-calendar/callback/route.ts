import { callbackIntegrationController } from "@modules/integrations/controllers/integration.controller";

export function GET(request: Request) {
  return callbackIntegrationController("google_calendar", request);
}

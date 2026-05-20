import { connectIntegrationController } from "@modules/integrations/controllers/integration.controller";

export function GET(request: Request) {
  return connectIntegrationController("google_calendar", request);
}

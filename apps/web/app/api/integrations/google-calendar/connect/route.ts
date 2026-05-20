import { connectIntegrationController } from "@modules/integrations/controllers/integration.controller";

export function GET() {
  return connectIntegrationController("google_calendar");
}

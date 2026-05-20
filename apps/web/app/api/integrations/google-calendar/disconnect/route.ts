import { disconnectIntegrationController } from "@modules/integrations/controllers/integration.controller";

export function POST(request: Request) {
  return disconnectIntegrationController("google_calendar", request);
}

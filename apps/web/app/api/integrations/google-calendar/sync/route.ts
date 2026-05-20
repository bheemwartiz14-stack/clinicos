import { syncGoogleCalendarController } from "@modules/integrations/controllers/google-calendar.controller";

export function POST(request: Request) {
  return syncGoogleCalendarController(request);
}

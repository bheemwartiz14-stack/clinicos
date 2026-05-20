import { createGoogleMeetLinkController } from "@modules/integrations/controllers/google-meet.controller";

export function POST(request: Request) {
  return createGoogleMeetLinkController(request);
}

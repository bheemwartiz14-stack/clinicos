import { saveGoogleMeetSettingsController } from "@modules/integrations/controllers/google-meet.controller";

export function POST(request: Request) {
  return saveGoogleMeetSettingsController(request);
}

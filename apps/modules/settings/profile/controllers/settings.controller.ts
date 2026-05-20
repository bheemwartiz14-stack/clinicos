import { settingsService } from "../services/settings.service";

export const settingsController = {
  overview: settingsService.overview,
  profile: settingsService.getProfile
};

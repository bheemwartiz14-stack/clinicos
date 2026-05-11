import {
  generalSettingsPageController,
  updateGeneralSettingsAction,
} from "@/modules/setting/genral-setting";
import { GeneralSettingsView } from "@/modules/setting/genral-setting/views/genral-setting.view";
export default async function GeneralSettingsPage() {
  const model = await generalSettingsPageController();
  return <GeneralSettingsView {...model} updateAction={updateGeneralSettingsAction} />;
}

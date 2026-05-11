import { generalSettingsPageController } from "@/modules/setting/genral-setting";

export async function GET() {
  const data = await generalSettingsPageController();

  return Response.json(data);
}

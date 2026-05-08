import { getAccessControlPageData } from "./access-control.service";

export async function accessControlPageController() {
  return getAccessControlPageData();
}
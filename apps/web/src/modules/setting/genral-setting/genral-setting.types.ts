import type { GeneralSettingsInput } from "./genral-setting.validation";

export type SocialMediaLinks = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
};

export type GeneralSettingsAddress = {
  addressLine?: string;
  country?: string;
  countryCode?: string;
  state?: string;
  stateCode?: string;
  city?: string;
};

export type GeneralSettings = {
  id: string;
  companyName: string;
  tagline: string | null;
  supportEmail: string;
  supportPhone: string | null;
  address: GeneralSettingsAddress | null;
  socialMediaLinks: SocialMediaLinks | null;
  mainLogo: string | null;
  favicon: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GeneralSettingsPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  settings: GeneralSettings | null;
};

export type ActionState = {
  ok: boolean;
  message: string;
};

export type UpdateGeneralSettingsInput = GeneralSettingsInput;

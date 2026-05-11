import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().url("Enter a valid URL").optional());

export const generalSettingsSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required").max(255),
  tagline: z
    .string()
    .trim()
    .max(500, "Tagline must be 500 characters or fewer")
    .optional()
    .transform((value) => (value ? value : undefined)),
  supportEmail: z.string().trim().email("Enter a valid support email").max(255),
  supportPhone: z
    .string()
    .trim()
    .max(50, "Support phone must be 50 characters or fewer")
    .optional()
    .transform((value) => (value ? value : undefined)),
  address: z.object({
    addressLine: z
      .string()
      .trim()
      .max(500, "Address line must be 500 characters or fewer")
      .optional()
      .transform((value) => (value ? value : undefined)),
    country: z
      .string()
      .trim()
      .max(120, "Country must be 120 characters or fewer")
      .optional()
      .transform((value) => (value ? value : undefined)),
    countryCode: z
      .string()
      .trim()
      .max(3, "Country code must be 3 characters or fewer")
      .optional()
      .transform((value) => (value ? value : undefined)),
    state: z
      .string()
      .trim()
      .max(120, "State must be 120 characters or fewer")
      .optional()
      .transform((value) => (value ? value : undefined)),
    stateCode: z
      .string()
      .trim()
      .max(10, "State code must be 10 characters or fewer")
      .optional()
      .transform((value) => (value ? value : undefined)),
    city: z
      .string()
      .trim()
      .max(120, "City must be 120 characters or fewer")
      .optional()
      .transform((value) => (value ? value : undefined)),
  }),
  socialMediaLinks: z.object({
    facebook: optionalUrlSchema,
    instagram: optionalUrlSchema,
    twitter: optionalUrlSchema,
    linkedin: optionalUrlSchema,
    youtube: optionalUrlSchema,
    website: optionalUrlSchema,
  }),
  mainLogo: z
    .string()
    .trim()
    .max(1000, "Main logo path must be 1000 characters or fewer")
    .optional()
    .transform((value) => (value ? value : undefined)),
  favicon: z
    .string()
    .trim()
    .max(1000, "Favicon path must be 1000 characters or fewer")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;

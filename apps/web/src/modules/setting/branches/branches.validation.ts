import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

export const branchAddressSchema = z.object({
  addressLine1: optionalText,
  addressLine2: optionalText,
  country: optionalText,
  state: optionalText,
  city: optionalText,
  postalCode: optionalText,
});

export const createBranchSchema = z.object({
  name: z.string().trim().min(2, "Branch name must be at least 2 characters.").max(180),
  code: z.string().trim().min(2, "Branch code must be at least 2 characters.").max(60),
  type: z.string().trim().min(2, "Branch type is required.").max(80).default("clinic"),
  supportEmail: optionalText,
  supportPhone: optionalText,
  managerId: optionalText,
  address: branchAddressSchema.optional(),
  notes: optionalText,
  isMain: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateBranchSchema = createBranchSchema.extend({
  id: z.string().uuid(),
});

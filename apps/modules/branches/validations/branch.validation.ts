import { z } from "zod";

export const branchStatuses = ["active", "inactive", "maintenance"] as const;

export const operatingDaySchema = z
  .object({
    open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm time"),
    close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm time"),
    closed: z.boolean()
  })
  .refine((day) => day.closed || day.open < day.close, {
    message: "Closing time must be after opening time",
    path: ["close"]
  });

export const operatingHoursSchema = z.object({
  monday: operatingDaySchema,
  tuesday: operatingDaySchema,
  wednesday: operatingDaySchema,
  thursday: operatingDaySchema,
  friday: operatingDaySchema,
  saturday: operatingDaySchema,
  sunday: operatingDaySchema
});

export const defaultOperatingHours: OperatingHoursInput = {
  monday: { open: "08:00", close: "17:00", closed: false },
  tuesday: { open: "08:00", close: "17:00", closed: false },
  wednesday: { open: "08:00", close: "17:00", closed: false },
  thursday: { open: "08:00", close: "17:00", closed: false },
  friday: { open: "08:00", close: "17:00", closed: false },
  saturday: { open: "09:00", close: "13:00", closed: false },
  sunday: { open: "09:00", close: "13:00", closed: true }
};

export const branchUpsertSchema = z.object({
  name: z.string().trim().min(2, "Branch name is required").max(160),
  npi: z.string().trim().max(32).optional().or(z.literal("")),
  profile: z.string().trim().max(2000).default(""),
  phone: z.string().trim().min(7, "Phone is required").max(32),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  addressLine1: z.string().trim().min(2, "Address line 1 is required").max(255),
  addressLine2: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(120),
  state: z.string().trim().length(2, "Use a 2-letter state"),
  postalCode: z.string().trim().min(5, "Postal code is required").max(16),
  timezone: z.string().trim().min(1, "Timezone is required").max(64),
  status: z.enum(branchStatuses),
  isMain: z.boolean().default(false),
  operatingHours: operatingHoursSchema
});

export const branchUpdateSchema = branchUpsertSchema.extend({
  id: z.string().uuid()
});

export type BranchStatus = (typeof branchStatuses)[number];
export type OperatingHoursInput = z.infer<typeof operatingHoursSchema>;
export type BranchUpsertInput = z.infer<typeof branchUpsertSchema>;
export type BranchUpdateInput = z.infer<typeof branchUpdateSchema>;

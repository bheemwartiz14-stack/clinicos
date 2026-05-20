import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().nullable().transform((value) => (value === "" ? null : value));

const avatarValue = z
  .string()
  .trim()
  .max(1_500_000, "Avatar must be under 1 MB")
  .refine((value) => value === "" || value.startsWith("data:image/") || value.startsWith("http://") || value.startsWith("https://"), "Upload a valid image avatar")
  .optional()
  .nullable()
  .transform((value) => (value === "" ? null : value));

export const emergencyContactSchema = z.object({
  name: optionalText(120),
  phone: optionalText(32),
  relationship: optionalText(80)
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Full name is required").max(160),
  username: optionalText(64),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: optionalText(32),
  avatar: avatarValue,
  gender: optionalText(32),
  dob: optionalText(10),
  address: optionalText(255),
  city: optionalText(120),
  state: optionalText(120),
  zipCode: optionalText(20),
  country: optionalText(120),
  emergencyContact: emergencyContactSchema,
  bio: optionalText(1000),
  branchId: z.string().uuid("Select a valid branch"),
  departmentId: z.string().uuid().optional().nullable(),
  specialty: optionalText(120),
  licenseNumber: optionalText(64),
  experienceYears: z.coerce.number().int().min(0).max(80).optional().default(0),
  consultationFee: z.coerce.number().min(0).max(100000).optional().default(0)
});

export const accountUpdateSchema = z.object({
  username: optionalText(64),
  email: z.string().trim().email("Enter a valid email address").max(255),
  profileVisibility: z.enum(["private", "team", "clinic"]).default("team")
});

export const notificationPreferenceSchema = z.object({
  emailNotifications: z.coerce.boolean(),
  smsNotifications: z.coerce.boolean(),
  whatsappNotifications: z.coerce.boolean(),
  appointmentAlerts: z.coerce.boolean(),
  billingAlerts: z.coerce.boolean(),
  systemAlerts: z.coerce.boolean(),
  quietHoursStart: optionalText(16),
  quietHoursEnd: optionalText(16)
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[0-9]/, "Add a number")
      .regex(/[^A-Za-z0-9]/, "Add a special character"),
    confirmPassword: z.string().min(1, "Confirm the new password"),
    logoutOtherDevices: z.coerce.boolean().default(true)
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
export type NotificationPreferenceInput = z.infer<typeof notificationPreferenceSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;

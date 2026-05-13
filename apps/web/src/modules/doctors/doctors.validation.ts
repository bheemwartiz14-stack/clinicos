import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) => value.startsWith("/") || z.string().url().safeParse(value).success,
      "Enter a valid URL or uploaded file path.",
    )
    .optional(),
);

const optionalInteger = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.coerce.number().int().min(0).optional(),
);

const optionalMoney = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount.")
    .optional(),
);

const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional(),
);

export const createDoctorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(160),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters."),
  emailVerified: z.boolean().default(false),
  portalLoginEnabled: z
    .boolean()
    .refine((value) => value, "Doctor portal login must be enabled to create a doctor account."),
  image: optionalUrl,
  firstName: optionalText,
  lastName: optionalText,
  phone: optionalText,
  gender: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.enum(["male", "female", "other"]).optional(),
  ),
  dateOfBirth: optionalDate,
  address: optionalText,
  city: optionalText,
  state: optionalText,
  country: optionalText,
  postalCode: optionalText,
  departmentId: z
    .string({ required_error: "Please select a department." })
    .uuid("Please select a department."),
  branchId: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().uuid("Please select a clinic branch.").optional(),
  ),
  specialization: z.string().trim().min(2, "Specialization is required.").max(150),
  qualification: optionalText,
  experienceYears: optionalInteger,
  consultationFee: optionalMoney,
  licenseNumber: optionalText,
  bio: optionalText,
  isAvailable: z.boolean().default(true),
});

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

const requiredUuid = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string({ required_error: "Please select a role." }).uuid("Please select a role."),
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
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional(),
);

const userProfileSchema = {
  firstName: optionalText,
  lastName: optionalText,
  phone: optionalText,
  gender: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.enum(["male", "female", "other"]).optional(),
  ),
  dateOfBirth: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional(),
  ),
  avatarUrl: optionalUrl,
  address: optionalText,
  city: optionalText,
  state: optionalText,
  country: optionalText,
  postalCode: optionalText,
};

const roleDetailsSchema = {
  roleName: optionalText,
  specialization: optionalText,
  qualification: optionalText,
  experienceYears: optionalInteger,
  consultationFee: optionalMoney,
  licenseNumber: optionalText,
  department: optionalText,
  bio: optionalText,
  employeeCode: optionalText,
  shift: optionalText,
  deskNumber: optionalText,
  joiningDate: optionalDate,
};

function validateRoleDetails(
  value: { roleName?: string; specialization?: string; department?: string; employeeCode?: string },
  ctx: z.RefinementCtx,
) {
  if (value.roleName === "doctor" && !value.specialization) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["specialization"],
      message: "Specialization is required for doctors.",
    });
  }

  if (value.roleName === "doctor" && !value.department) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["department"],
      message: "Department is required for doctors.",
    });
  }

  if (value.roleName === "receptionist" && !value.employeeCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["employeeCode"],
      message: "Employee code is required for receptionists.",
    });
  }
}

const createUserBaseSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(160),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters."),
  emailVerified: z.boolean().default(false),
  image: optionalUrl,
  roleId: requiredUuid,
  ...userProfileSchema,
  ...roleDetailsSchema,
});

export const createUserSchema = createUserBaseSchema.superRefine(validateRoleDetails);

export const updateUserSchema = createUserBaseSchema
  .omit({ password: true })
  .extend({
    id: z.string().uuid(),
    password: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().min(8, "Password must be at least 8 characters.").optional(),
    ),
  })
  .superRefine(validateRoleDetails);

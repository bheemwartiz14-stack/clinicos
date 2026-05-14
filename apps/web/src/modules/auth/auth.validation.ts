import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .transform((value) => value.toLowerCase().trim()),

  password: z.string().min(1, "Password is required"),
});
"use server";

import { db, schema } from "@mediclinicpro/db";
import { patientCreateSchema } from "@mediclinicpro/validations";

export async function createPatientAction(formData: FormData) {
  const input = patientCreateSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    bloodGroup: formData.get("bloodGroup"),
    address: formData.get("address"),
    allergies: formData.get("allergies"),
  });

  const [patient] = await db.insert(schema.patients).values(input).returning();
  return patient;
}

import { schema, type Db } from "@mediclinicpro/db";
import type { z } from "zod";
import type { appointmentCreateSchema } from "@mediclinicpro/validations";
import { and, eq, gte, lte } from "drizzle-orm";

export function listAppointmentsByRange(db: Db, input: { from: Date; to: Date }) {
  return db.query.appointments.findMany({
    where: and(gte(schema.appointments.startsAt, input.from), lte(schema.appointments.startsAt, input.to)),
    with: { patient: true, doctor: true },
  });
}

export function createAppointment(db: Db, input: z.infer<typeof appointmentCreateSchema>) {
  return db.insert(schema.appointments).values(input).returning();
}

export function updateAppointmentStatus(
  db: Db,
  input: { id: string; status: "scheduled" | "checked_in" | "completed" | "cancelled" },
) {
  return db
    .update(schema.appointments)
    .set({ status: input.status, updatedAt: new Date() })
    .where(eq(schema.appointments.id, input.id))
    .returning();
}

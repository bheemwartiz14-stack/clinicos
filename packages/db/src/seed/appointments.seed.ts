import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "../index.js";

export async function seedAppointmentAvailability() {
  console.log("🌱 Appointment availability seeding started...");

  const doctors = await db
    .select({
      branchId: schema.doctors.branchId,
      id: schema.doctors.id,
    })
    .from(schema.doctors)
    .where(eq(schema.doctors.isAvailable, true));
  for (const doctor of doctors) {
    for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
      const existing = await db.query.doctorAvailabilitySlots.findFirst({
        where: and(
          eq(schema.doctorAvailabilitySlots.doctorId, doctor.id),
          eq(schema.doctorAvailabilitySlots.dayOfWeek, dayOfWeek),
          isNull(schema.doctorAvailabilitySlots.availableDate),
        ),
      });
      if (existing) continue;
      await db.insert(schema.doctorAvailabilitySlots).values({
        branchId: doctor.branchId,
        dayOfWeek,
        doctorId: doctor.id,
        endTime: "17:00",
        maxAppointments: 1,
        notes: "Default OPD availability",
        slotDurationMinutes: 15,
        startTime: "09:00",
      });
    }
  }
  console.log("✅ Appointment availability seeded");
}

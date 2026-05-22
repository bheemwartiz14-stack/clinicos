import { NextRequest, NextResponse } from "next/server";
import { db, doctorAvailabilitySlots, doctors, users, doctorSpecialties } from "@mediclinic/db";
import { and, eq, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const doctorId = request.nextUrl.searchParams.get("doctorId");
  const date = request.nextUrl.searchParams.get("date");

  if (!doctorId || !date) {
    return NextResponse.json([]);
  }

  const rows = await db
    .select({
      id: doctorAvailabilitySlots.id,
      slotDate: doctorAvailabilitySlots.slotDate,
      startTime: doctorAvailabilitySlots.startTime,
      endTime: doctorAvailabilitySlots.endTime,
      doctorId: doctorAvailabilitySlots.doctorId,
      doctorName: users.firstName,
      doctorSpecialty: doctorSpecialties.name,
    })
    .from(doctorAvailabilitySlots)
    .innerJoin(doctors, eq(doctorAvailabilitySlots.doctorId, doctors.id))
    .innerJoin(users, eq(doctors.userId, users.id))
    .leftJoin(doctorSpecialties, eq(doctors.specialtyId, doctorSpecialties.id))
    .where(
      and(
        eq(doctorAvailabilitySlots.doctorId, doctorId),
        eq(doctorAvailabilitySlots.slotDate, date),
        eq(doctorAvailabilitySlots.isBooked, false),
        eq(doctorAvailabilitySlots.isBlocked, false)
      )
    )
    .orderBy(asc(doctorAvailabilitySlots.startTime));

  return NextResponse.json(rows);
}

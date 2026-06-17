import { NextRequest, NextResponse } from "next/server";
import { appointmentRepository } from "@modules/appointments/repository/appointment.repository";

export async function GET(request: NextRequest) {
  const doctorId = request.nextUrl.searchParams.get("doctorId");
  const date = request.nextUrl.searchParams.get("date");

  if (!doctorId || !date) {
    return NextResponse.json([]);
  }

  const slots = await appointmentRepository.findAllSlots(doctorId, date);
  return NextResponse.json(slots);
}

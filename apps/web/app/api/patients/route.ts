import { NextRequest, NextResponse } from "next/server";
import { db, patients } from "@mediclinic/db";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const [created] = await db
    .insert(patients)
    .values({
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || null,
      dateOfBirth: body.dateOfBirth || null,
      gender: body.gender || null,
      bloodGroup: body.bloodGroup || null,
      address: body.address || null,
      emergencyContactName: body.emergencyContactName || null,
      emergencyContactPhone: body.emergencyContactPhone || null,
      isActive: true
    })
    .returning({ id: patients.id, fullName: patients.fullName, phone: patients.phone });

  return NextResponse.json(created);
}

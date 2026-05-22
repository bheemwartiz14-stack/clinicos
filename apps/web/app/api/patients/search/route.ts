import { NextRequest, NextResponse } from "next/server";
import { db, patients } from "@mediclinic/db";
import { ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  const like = `%${q}%`;
  const rows = await db
    .select({ id: patients.id, fullName: patients.fullName, phone: patients.phone })
    .from(patients)
    .where(
      or(
        ilike(patients.fullName, like),
        ilike(patients.phone, like),
        ilike(patients.email, like)
      )
    )
    .limit(20);

  return NextResponse.json(rows);
}

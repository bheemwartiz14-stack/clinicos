import { and, count, desc, eq, gte, lte, sql, sum, inArray } from "drizzle-orm";
import { db, doctors, users, doctorSalaryStructures, doctorEarnings, doctorPayouts, appointments, invoices, patients } from "@mediclinic/db";

export type DoctorPayoutSettingRecord = {
  id: string;
  doctorId: string;
  doctorName: string;
  salaryType: string;
  fixedSalary: string;
  commissionPercentage: string;
  isActive: boolean;
};

export type PayoutRecord = {
  id: string;
  doctorId: string;
  doctorName: string;
  month: number;
  year: number;
  totalEarnings: string;
  fixedSalaryAmount: string;
  commissionAmount: string;
  paidAmount: string;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
};

export type DoctorEarningRecord = {
  id: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string | null;
  invoiceId: string | null;
  consultationAmount: string;
  commissionAmount: string;
  earningDate: string;
  createdAt: Date;
};

export const payrollService = {
  async listDoctorPayoutSettings(): Promise<DoctorPayoutSettingRecord[]> {
    const rows = await db
      .select({
        structure: doctorSalaryStructures,
        doctor: doctors,
        user: users,
      })
      .from(doctorSalaryStructures)
      .innerJoin(doctors, eq(doctorSalaryStructures.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .orderBy(desc(doctorSalaryStructures.createdAt));

    return rows.map(({ structure, user }) => ({
      id: structure.id,
      doctorId: structure.doctorId,
      doctorName: [user.firstName, user.lastName].filter(Boolean).join(" "),
      salaryType: structure.salaryType,
      fixedSalary: structure.fixedSalary,
      commissionPercentage: structure.commissionPercentage,
      isActive: structure.isActive,
    }));
  },

  async upsertPayoutSetting(input: {
    doctorId: string;
    salaryType: "fixed" | "commission" | "fixed_plus_commission";
    fixedSalary: string;
    commissionPercentage: string;
  }) {
    const existing = await db
      .select()
      .from(doctorSalaryStructures)
      .where(eq(doctorSalaryStructures.doctorId, input.doctorId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(doctorSalaryStructures)
        .set({
          salaryType: input.salaryType,
          fixedSalary: input.fixedSalary,
          commissionPercentage: input.commissionPercentage,
        })
        .where(eq(doctorSalaryStructures.doctorId, input.doctorId));
    } else {
      await db.insert(doctorSalaryStructures).values(input);
    }
  },

  async calculateEarnings(doctorId: string, fromDate: string, toDate: string) {
    const settings = await db
      .select()
      .from(doctorSalaryStructures)
      .where(and(eq(doctorSalaryStructures.doctorId, doctorId), eq(doctorSalaryStructures.isActive, true)))
      .limit(1);

    const appts = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.status, "completed"),
          gte(appointments.appointmentDate, fromDate),
          lte(appointments.appointmentDate, toDate),
        )
      );

    const appointmentIds = appts.map((a) => a.id);
    let totalConsultation = 0;

    if (appointmentIds.length > 0) {
      const invRows = await db
        .select({
          total: sql<string>`COALESCE(SUM(${invoices.totalAmount}), '0')`,
        })
        .from(invoices)
        .where(and(
          eq(invoices.paymentStatus, "paid"),
          inArray(invoices.appointmentId, appointmentIds),
        ));

      totalConsultation = parseFloat(invRows[0]?.total ?? "0");
    }

    const setting = settings[0];
    let fixedAmount = 0;
    let commissionAmount = 0;

    if (setting) {
      if (setting.salaryType === "fixed" || setting.salaryType === "fixed_plus_commission") {
        fixedAmount = parseFloat(setting.fixedSalary);
      }
      if (setting.salaryType === "commission" || setting.salaryType === "fixed_plus_commission") {
        commissionAmount = totalConsultation * (parseFloat(setting.commissionPercentage) / 100);
      }
    }

    return {
      totalAppointments: appts.length,
      totalConsultation,
      totalEarnings: fixedAmount + commissionAmount,
      fixedAmount,
      commissionAmount,
    };
  },

  async generatePayoutBatch(month: number, year: number) {
    const doctorsList = await db
      .select({ id: doctors.id })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(users.status, "active"));

    const fromDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const toDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const batchId = `${year}-${String(month).padStart(2, "0")}`;

    for (const doc of doctorsList) {
      const earnings = await this.calculateEarnings(doc.id, fromDate, toDate);

      const existing = await db
        .select({ id: doctorPayouts.id })
        .from(doctorPayouts)
        .where(and(eq(doctorPayouts.doctorId, doc.id), eq(doctorPayouts.month, month), eq(doctorPayouts.year, year)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(doctorPayouts).values({
          doctorId: doc.id,
          month,
          year,
          totalEarnings: String(earnings.totalEarnings),
          fixedSalaryAmount: String(earnings.fixedAmount),
          commissionAmount: String(earnings.commissionAmount),
          paidAmount: "0",
          status: "pending",
        });
      }
    }

    return batchId;
  },

  async listPayouts(filters?: { month?: number; year?: number; status?: string }): Promise<PayoutRecord[]> {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filters?.month) conditions.push(eq(doctorPayouts.month, filters.month));
    if (filters?.year) conditions.push(eq(doctorPayouts.year, filters.year));
    if (filters?.status) conditions.push(eq(doctorPayouts.status, filters.status as any));

    let query = db
      .select({
        payout: doctorPayouts,
        doctor: doctors,
        user: users,
      })
      .from(doctorPayouts)
      .innerJoin(doctors, eq(doctorPayouts.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id));

    if (conditions.length) {
      query = query.where(and(...conditions)) as any;
    }

    const rows = await query.orderBy(desc(doctorPayouts.createdAt));

    return rows.map(({ payout, user }) => ({
      id: payout.id,
      doctorId: payout.doctorId,
      doctorName: [user.firstName, user.lastName].filter(Boolean).join(" "),
      month: payout.month,
      year: payout.year,
      totalEarnings: payout.totalEarnings,
      fixedSalaryAmount: payout.fixedSalaryAmount,
      commissionAmount: payout.commissionAmount,
      paidAmount: payout.paidAmount,
      status: payout.status,
      paidAt: payout.paidAt,
      createdAt: payout.createdAt,
    }));
  },

  async markAsPaid(payoutId: string) {
    await db
      .update(doctorPayouts)
      .set({
        status: "paid",
        paidAt: new Date(),
        paidAmount: sql`${doctorPayouts.totalEarnings}`,
      })
      .where(eq(doctorPayouts.id, payoutId));
  },

  async getPayoutReport(month: number, year: number) {
    const payouts = await this.listPayouts({ month, year });
    const totalPaid = payouts.reduce((sum, p) => sum + parseFloat(p.paidAmount), 0);
    const totalPending = payouts.filter((p) => p.status === "pending").reduce((sum, p) => sum + parseFloat(p.totalEarnings), 0);

    return {
      payouts,
      totalPaid,
      totalPending,
      totalDoctors: payouts.length,
    };
  },

  async getPaymentHistory() {
    return this.listPayouts({ status: "paid" });
  },
};



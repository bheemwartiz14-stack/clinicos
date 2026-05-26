import { and, count, desc, eq, ilike, inArray, like, or, sql } from "drizzle-orm";
import { db, invoices, invoiceItems, payments, patients, appointments, doctors, users } from "@mediclinic/db";

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  appointmentId: string | null;
  subtotal: string;
  gstAmount: string;
  discountAmount: string;
  totalAmount: string;
  paymentStatus: string;
  invoicePdfUrl: string | null;
  createdAt: Date;
};

export type InvoiceItemRecord = {
  id: string;
  invoiceId: string;
  itemName: string;
  description: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type PaymentRecord = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  patientName: string;
  amount: string;
  method: string;
  status: string;
  transactionId: string | null;
  notes: string | null;
  paidAt: Date;
};

function formatInvoiceNumber(index: number): string {
  const year = new Date().getFullYear();
  const num = String(index).padStart(5, "0");
  return `INV-${year}-${num}`;
}

export const billingService = {
  async listInvoices(search?: { q?: string; status?: string }): Promise<InvoiceRecord[]> {
    const conditions: ReturnType<typeof eq>[] = [];

    if (search?.status && search.status !== "all") {
      conditions.push(eq(invoices.paymentStatus, search.status as any));
    }

    let query = db
      .select({
        invoice: invoices,
        patient: patients,
      })
      .from(invoices)
      .innerJoin(patients, eq(invoices.patientId, patients.id));

    if (search?.q) {
      const like = `%${search.q}%`;
      query = query.where(
        or(
          ilike(invoices.invoiceNumber, like),
          ilike(patients.fullName, like),
          ilike(patients.phone, like),
        )
      ) as any;
    } else if (conditions.length) {
      query = query.where(and(...conditions)) as any;
    }

    const rows = await query.orderBy(desc(invoices.createdAt));

    return rows.map(({ invoice, patient }) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId,
      patientName: patient.fullName,
      appointmentId: invoice.appointmentId,
      subtotal: invoice.subtotal,
      gstAmount: invoice.gstAmount,
      discountAmount: invoice.discountAmount,
      totalAmount: invoice.totalAmount,
      paymentStatus: invoice.paymentStatus,
      invoicePdfUrl: invoice.invoicePdfUrl,
      createdAt: invoice.createdAt,
    }));
  },

  async getInvoice(id: string): Promise<{
    invoice: InvoiceRecord;
    items: InvoiceItemRecord[];
    payments: PaymentRecord[];
  } | null> {
    const [row] = await db
      .select({ invoice: invoices, patient: patients })
      .from(invoices)
      .innerJoin(patients, eq(invoices.patientId, patients.id))
      .where(eq(invoices.id, id))
      .limit(1);
    if (!row) return null;

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    const paymentRows = await db
      .select({
        payment: payments,
        invoice: invoices,
        patient: patients,
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(patients, eq(invoices.patientId, patients.id))
      .where(eq(payments.invoiceId, id))
      .orderBy(desc(payments.paidAt));

    return {
      invoice: {
        id: row.invoice.id,
        invoiceNumber: row.invoice.invoiceNumber,
        patientId: row.invoice.patientId,
        patientName: row.patient.fullName,
        appointmentId: row.invoice.appointmentId,
        subtotal: row.invoice.subtotal,
        gstAmount: row.invoice.gstAmount,
        discountAmount: row.invoice.discountAmount,
        totalAmount: row.invoice.totalAmount,
        paymentStatus: row.invoice.paymentStatus,
        invoicePdfUrl: row.invoice.invoicePdfUrl,
        createdAt: row.invoice.createdAt,
      },
      items: items.map((item) => ({
        id: item.id,
        invoiceId: item.invoiceId,
        itemName: item.itemName,
        description: item.description ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      payments: paymentRows.map(({ payment }) => ({
        id: payment.id,
        invoiceId: payment.invoiceId,
        invoiceNumber: row.invoice.invoiceNumber,
        patientName: row.patient.fullName,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        notes: payment.notes,
        paidAt: payment.paidAt,
      })),
    };
  },

  async createInvoice(input: {
    patientId: string;
    appointmentId?: string | null;
    items: Array<{
      itemName: string;
      description?: string | null;
      quantity: number;
      unitPrice: string;
    }>;
    gstPercent?: number;
    discountPercent?: number;
  }) {
    const [countResult] = await db.select({ value: count() }).from(invoices);
    const nextNum = (Number(countResult?.value ?? 0)) + 1;
    const invoiceNumber = formatInvoiceNumber(nextNum);

    const subtotalCents = input.items.reduce((sum, item) => {
      const unit = parseFloat(item.unitPrice) || 0;
      return sum + unit * item.quantity;
    }, 0);
    const subtotal = subtotalCents.toFixed(2);
    const gstPercent = input.gstPercent ?? 0;
    const discountPercent = input.discountPercent ?? 0;
    const gstAmount = (subtotalCents * gstPercent / 100).toFixed(2);
    const discountAmount = (subtotalCents * discountPercent / 100).toFixed(2);
    const total = (subtotalCents + parseFloat(gstAmount) - parseFloat(discountAmount)).toFixed(2);

    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        patientId: input.patientId,
        appointmentId: input.appointmentId ?? null,
        subtotal,
        gstAmount,
        discountAmount,
        totalAmount: total,
        paymentStatus: "pending",
      })
      .returning();

    if (input.items.length > 0) {
      await db.insert(invoiceItems).values(
        input.items.map((item) => ({
          invoiceId: invoice.id,
          itemName: item.itemName,
          description: item.description ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
        }))
      );
    }

    return invoice;
  },

  async recordPayment(input: {
    invoiceId: string;
    amount: string;
    method: "cash" | "upi" | "card" | "bank_transfer";
    transactionId?: string | null;
    notes?: string | null;
  }) {
    const [payment] = await db
      .insert(payments)
      .values({
        invoiceId: input.invoiceId,
        amount: input.amount,
        method: input.method,
        status: "paid",
        transactionId: input.transactionId ?? null,
        notes: input.notes ?? null,
      })
      .returning();

    const invoicePayments = await db
      .select({ total: sql<string>`SUM(${payments.amount})` })
      .from(payments)
      .where(eq(payments.invoiceId, input.invoiceId));

    const [inv] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, input.invoiceId))
      .limit(1);

    if (inv) {
      const paidTotal = parseFloat(invoicePayments[0]?.total ?? "0");
      const invoiceTotal = parseFloat(inv.totalAmount);
      let newStatus: string;
      if (paidTotal >= invoiceTotal) {
        newStatus = "paid";
      } else if (paidTotal > 0) {
        newStatus = "partial";
      } else {
        newStatus = "pending";
      }
      await db.update(invoices).set({ paymentStatus: newStatus as any }).where(eq(invoices.id, input.invoiceId));
    }

    return payment;
  },

  async listPayments(search?: { q?: string }): Promise<PaymentRecord[]> {
    const query = db
      .select({
        payment: payments,
        invoice: invoices,
        patient: patients,
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(patients, eq(invoices.patientId, patients.id));

    if (search?.q) {
      const like = `%${search.q}%`;
      return (await query
        .where(
          or(
            ilike(invoices.invoiceNumber, like),
            ilike(patients.fullName, like),
          )
        )
        .orderBy(desc(payments.paidAt)) as any[]).map(({ payment, invoice, patient }) => ({
        id: payment.id,
        invoiceId: payment.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        patientName: patient.fullName,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        notes: payment.notes,
        paidAt: payment.paidAt,
      }));
    }

    const rows = await query.orderBy(desc(payments.paidAt));
    return rows.map(({ payment, invoice, patient }) => ({
      id: payment.id,
      invoiceId: payment.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      patientName: patient.fullName,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transactionId: payment.transactionId,
      notes: payment.notes,
      paidAt: payment.paidAt,
    }));
  },

  async listPending(): Promise<InvoiceRecord[]> {
    return this.listInvoices({ status: "pending" });
  },

  async deleteInvoice(id: string) {
    await db.delete(invoices).where(eq(invoices.id, id));
  },
};

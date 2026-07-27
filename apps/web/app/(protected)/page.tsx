import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  CalendarCheck2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Plus,
  Stethoscope,
  UsersRound,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { requirePagePermission } from "@/lib/auth";
import { dashboardService } from "@modules/dashboard/services/dashboard.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "MediClinic Pro",
    description:
      "Secure clinic operations dashboard for appointments, queue management, billing, payroll, and AI-assisted workflows.",
  };
}

export default async function HomePage() {
  const session = await requirePagePermission("dashboard.view");
  const roleLabel =
    session.role === "admin" ? "Administrator" :
    session.role === "doctor" ? "Physician" :
    session.role === "receptionist" ? "Front Desk" :
    "Accounting";
  const greeting =
    session.role === "doctor" ? `Good to see you, Dr. ${session.name}` :
    `Welcome back, ${session.name}`;
  const subtitle =
    session.role === "admin" ? "Monitor providers, capacity, and clinic operations." :
    session.role === "doctor" ? "Track your schedule, patient queue, and today's activity." :
    session.role === "receptionist" ? "Manage arrivals, appointments, and provider handoffs." :
    "Review revenue, invoices, and payment collections.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary text-[11px] font-medium">{roleLabel}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.role === "admin" && (
            <>
              <Button asChild size="sm">
                <Link href="/doctors/add"><Plus className="h-4 w-4" />Add Doctor</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/settings/staff-manage/create"><Plus className="h-4 w-4" />Add Staff</Link>
              </Button>
            </>
          )}
          {session.role === "receptionist" && (
            <Button asChild size="sm">
              <Link href="/appointments"><CalendarCheck2 className="h-4 w-4" />Manage Appointments</Link>
            </Button>
          )}
          {session.role === "accountant" && (
            <Button asChild size="sm">
              <Link href={"/billing/patients" as any}><DollarSign className="h-4 w-4" />View Billing</Link>
            </Button>
          )}
        </div>
      </div>

      {session.role === "admin" && <AdminDashboard />}
      {session.role === "doctor" && <DoctorDashboard userId={session.userId} />}
      {session.role === "receptionist" && <ReceptionistDashboard />}
      {session.role === "accountant" && <AccountantDashboard />}
    </div>
  );
}

async function AdminDashboard() {
  const data = await dashboardService.adminOverview();
  const availabilityRate = data.metrics.doctors ? Math.round((data.metrics.availableDoctors / data.metrics.doctors) * 100) : 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Doctors" value={data.metrics.doctors} detail={`${data.metrics.availableDoctors} available`} icon={Stethoscope} trend={`${availabilityRate}% coverage`} />
        <MetricCard title="Staff" value={data.metrics.staff} detail="Active clinic team profiles" icon={UsersRound} trend="Care team" />
        <MetricCard title="Today's Appointments" value={data.metrics.todayAppointments} detail="Scheduled for today" icon={CalendarCheck2} trend="Live day" />
        <MetricCard title="Total Patients" value={data.metrics.patients} detail="Registered patients" icon={Activity} trend="Patient panel" />
      </div>
    </>
  );
}

async function DoctorDashboard({ userId }: { userId: string }) {
  const data = await dashboardService.doctorOverview(userId);
  if (!data) {
    return <p className="text-sm text-muted-foreground">Doctor profile not found. Contact admin.</p>;
  }

  const appointmentStatusCounts: Record<string, number> = {};
  for (const a of data.todaySchedule) {
    appointmentStatusCounts[a.status] = (appointmentStatusCounts[a.status] || 0) + 1;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today's Appointments" value={data.todayAppointments} detail="Scheduled for today" icon={CalendarCheck2} trend="Care day" />
        <MetricCard title="Checked-in Now" value={data.checkedInNow} detail="Waiting for consultation" icon={Clock} trend="Now" />
        <MetricCard title="Completed Today" value={data.completedToday} detail="Successfully done" icon={Activity} trend="Closed visits" />
        <MetricCard title="Total Patients" value={data.totalPatients} detail="Across all appointments" icon={UsersRound} trend="Panel" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Your availability and consultation info.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignalCard label="Availability" value={data.isAvailable ? "Available" : "Unavailable"} />
            <SignalCard label="Specialty" value={data.specialty} />
            <SignalCard label="Consultation fee" value={`$${data.consultationFee}`} />
            <StatusGrid title="Status Breakdown" counts={appointmentStatusCounts} emptyLabel="No appointments today." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your appointments for today.</CardDescription>
            </div>
            <CardAction>
              <Button asChild variant="outline" size="sm"><Link href="/appointments">Full Calendar <ArrowRight className="h-3 w-3" /></Link></Button>
            </CardAction>
          </CardHeader>
          <CardContent className="p-0">
            {data.todaySchedule.length === 0 ? (
              <p className="py-12 text-sm text-muted-foreground text-center">No appointments scheduled for today.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.todaySchedule.map((appt) => (
                    <TableRow key={appt.id} className="group">
                      <TableCell className="pl-6 font-medium tabular-nums">{appt.startTime.slice(0, 5)}</TableCell>
                      <TableCell className="font-medium">{appt.patientName}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">{appt.type.replace(/_/g, " ")}</TableCell>
                      <TableCell className="pr-6">
                        <StatusBadge status={appt.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

async function ReceptionistDashboard() {
  const data = await dashboardService.receptionistOverview();
  const checkedIn = data.statusCounts["checked_in"] || 0;
  const confirmed = data.statusCounts["confirmed"] || 0;
  const completed = data.statusCounts["completed"] || 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today's Appointments" value={data.todayAppointments} detail="Scheduled today" icon={CalendarCheck2} trend="Desk view" />
        <MetricCard title="Checked-in" value={checkedIn} detail="Waiting for doctor" icon={Clock} trend="Queue" />
        <MetricCard title="Confirmed" value={confirmed} detail="Upcoming appointments" icon={Activity} trend="Expected" />
        <MetricCard title="Total Patients" value={data.patients} detail="Registered in system" icon={UsersRound} trend="Directory" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today at a Glance</CardTitle>
            <CardDescription>Quick stats for front desk operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SignalCard label="Doctors on duty" value={data.doctors} />
            <SignalCard label="Completed" value={completed} />
            <SignalCard label="Walk-ins / Other" value={(data.statusCounts["booked"] || 0) + (data.statusCounts["walk_in"] || 0)} />
            <SignalCard label="Cancelled / No-show" value={(data.statusCounts["cancelled"] || 0) + (data.statusCounts["no_show"] || 0)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Latest appointments booked or checked-in today.</CardDescription>
            </div>
            <CardAction>
              <Button asChild variant="outline" size="sm"><Link href="/appointments">View All <ArrowRight className="h-3 w-3" /></Link></Button>
            </CardAction>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentAppointments.length === 0 ? (
              <p className="py-12 text-sm text-muted-foreground text-center">No appointments today yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentAppointments.map((appt) => (
                    <TableRow key={appt.id} className="group">
                      <TableCell className="pl-6 font-medium tabular-nums">{appt.startTime.slice(0, 5)}</TableCell>
                      <TableCell className="font-medium">{appt.patientName}</TableCell>
                      <TableCell className="text-muted-foreground">{appt.doctorName}</TableCell>
                      <TableCell className="pr-6">
                        <StatusBadge status={appt.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

async function AccountantDashboard() {
  const data = await dashboardService.accountantOverview();

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today's Revenue" value={`$${data.todayRevenue.toFixed(2)}`} detail="Collected today" icon={DollarSign} trend="USD" />
        <MetricCard title="Pending Invoices" value={data.pendingInvoices} detail="Awaiting payment" icon={FileText} trend="AR watch" />
        <MetricCard title="Total Invoices" value={data.totalInvoices} detail="All time" icon={CreditCard} trend="Ledger" />
        <MetricCard title="Today's Invoices" value={data.todayInvoices} detail="Created today" icon={TrendingUp} trend="Daily close" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Status Overview</CardTitle>
          <CardDescription>Breakdown of invoice payment statuses across the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(data.payStatusCounts).length === 0 ? (
            <p className="py-12 text-sm text-muted-foreground text-center">No invoices yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(data.payStatusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 shadow-sm transition-colors hover:bg-accent/50">
                  <span className="text-sm font-medium capitalize text-muted-foreground">{status.replace(/_/g, " ")}</span>
                  <span className="text-xl font-bold tabular-nums">{count as number}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-5">
            <Button asChild variant="outline" size="sm">
              <Link href={"/billing/patients" as any}>View All Invoices <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  checked_in: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  no_show: "bg-neutral-50 text-neutral-600 border-neutral-200",
  booked: "bg-violet-50 text-violet-700 border-violet-200",
  walk_in: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function MetricCard({ title, value, detail, icon: Icon, trend }: { title: string; value: string | number; detail: string; icon: React.ComponentType<{ className?: string }>; trend: string }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{title}</span>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
          <Badge variant="outline" className="mb-1 rounded-full bg-primary/5 text-[11px] font-medium text-primary">{trend}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function SignalCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border bg-card px-5 py-3.5 shadow-sm transition-colors hover:bg-accent/50">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function StatusGrid({ title, counts, emptyLabel }: { title: string; counts: Record<string, number>; emptyLabel: string }) {
  const entries = Object.entries(counts);

  return (
    <Tabs defaultValue="summary" className="gap-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-medium">{title}</h4>
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="summary">
        {entries.length === 0 ? (
          <p className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">{emptyLabel}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {entries.slice(0, 4).map(([status, count]) => (
              <SignalCard key={status} label={status.replace(/_/g, " ")} value={count} />
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="details">
        {entries.length === 0 ? (
          <p className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">{emptyLabel}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {entries.map(([status, count]) => (
              <span key={status} className="inline-flex items-center rounded-full border bg-card px-3 py-1 text-xs font-medium capitalize shadow-sm">
                {status.replace(/_/g, " ")}: {count}
              </span>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

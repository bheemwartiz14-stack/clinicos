import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Bell,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Landmark,
  Mail,
  MessageSquare,
  Plus,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  UsersRound,
  XCircle,
} from "lucide-react";
import { requirePagePermission } from "@/lib/auth";
import { dashboardService } from "@modules/dashboard/services/dashboard.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Command Center | MediClinic Pro",
    description:
      "Secure clinic operations dashboard for appointments, queue management, billing, payroll, and AI-assisted workflows.",
  };
}

export default async function HomePage() {
  const session = await requirePagePermission("dashboard.view");
  const dashboardTitle =
    session.role === "admin" ? "Clinic Command Center" :
    session.role === "doctor" ? "Practice Dashboard" :
    session.role === "receptionist" ? "Front Desk Console" :
    "Revenue Dashboard";
  const dashboardDescription =
    session.role === "admin" ? `Welcome back, ${session.name}. Monitor providers, access, appointments, and capacity across your U.S. clinic.` :
    session.role === "doctor" ? `Welcome back, Dr. ${session.name}. Track your schedule, checked-in patients, and care activity for today.` :
    session.role === "receptionist" ? `Welcome back, ${session.name}. Coordinate arrivals, appointments, and provider handoffs from one desk.` :
    `Welcome back, ${session.name}. Review invoice volume and collections for the business day.`;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border bg-card text-card-foreground">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">{session.role} workspace</Badge>
              <Badge variant="outline">U.S. clinic management</Badge>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-normal">{dashboardTitle}</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{dashboardDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {session.role === "admin" && (
              <>
                <Button asChild>
                  <Link href="/doctors/add"><Plus className="h-4 w-4" />Add Doctor</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/settings/staff-manage/create"><Plus className="h-4 w-4" />Add Staff</Link>
                </Button>
              </>
            )}
            {session.role === "receptionist" && (
              <Button asChild>
                <Link href="/appointments"><CalendarCheck2 className="h-4 w-4" />Manage Appointments</Link>
              </Button>
            )}
            {session.role === "accountant" && (
              <Button asChild>
                <Link href={"/billing/patients" as any}><DollarSign className="h-4 w-4" />View Billing</Link>
              </Button>
            )}
          </div>
        </div>
        <div className="grid border-t bg-muted/30 sm:grid-cols-3">
          <HeroSignal icon={Building2} label="Market" value="United States" />
          <HeroSignal icon={ShieldCheck} label="Workflow" value="Access controlled" />
          <HeroSignal icon={Landmark} label="Finance" value="USD billing" />
        </div>
      </section>

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
  const apptStatusCounts = data.todayStatusCounts;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Doctors" value={data.metrics.doctors} detail={`${data.metrics.availableDoctors} available`} icon={Stethoscope} trend={`${availabilityRate}% coverage`} />
        <MetricCard title="Staff" value={data.metrics.staff} detail="Active clinic team profiles" icon={UsersRound} trend="Care team" />
        <MetricCard title="Today's Appointments" value={data.metrics.todayAppointments} detail="Scheduled for today" icon={CalendarCheck2} trend="Live day" />
        <MetricCard title="Total Patients" value={data.metrics.patients} detail="Registered patients" icon={Activity} trend="Patient panel" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operational Health</CardTitle>
            <CardDescription>Capacity, access, and setup signals for the current clinic workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ProgressRow label="Doctor availability" value={availabilityRate} caption={`${data.metrics.availableDoctors}/${data.metrics.doctors} doctors available`} />
            <div className="grid gap-3 sm:grid-cols-2">
              <SignalCard label="Active sessions" value={data.metrics.activeSessions} />
              <SignalCard label="Upcoming slots" value={data.metrics.upcomingSlots} />
              <SignalCard label="RBAC roles" value={data.metrics.roles} />
              <SignalCard label="Specialties" value={data.metrics.specialties} />
            </div>
            <StatusGrid title="Today's Appointment Status" counts={apptStatusCounts} emptyLabel="No appointments today." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Doctors</CardTitle>
              <CardDescription>Latest doctor profiles and availability state.</CardDescription>
            </div>
            <CardAction>
              <Button asChild variant="outline" size="sm"><Link href="/doctors">View All</Link></Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="font-medium">{doctor.name}</div>
                      <div className="text-xs text-muted-foreground">{doctor.email}</div>
                    </TableCell>
                    <TableCell>{doctor.specialty}</TableCell>
                    <TableCell>${doctor.consultationFee}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={doctor.status === "active" ? "default" : "outline"}>{doctor.status}</Badge>
                        <Badge variant={doctor.isAvailable ? "default" : "outline"}>{doctor.isAvailable ? "Available" : "Off"}</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.recentDoctors.length === 0 && <p className="py-8 text-sm text-muted-foreground text-center">No doctors yet.</p>}
          </CardContent>
        </Card>
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
              <Button asChild variant="outline" size="sm"><Link href="/appointments">Full Calendar</Link></Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {data.todaySchedule.length === 0 ? (
              <p className="py-8 text-sm text-muted-foreground text-center">No appointments scheduled for today.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.todaySchedule.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-medium">{appt.startTime.slice(0, 5)}</TableCell>
                      <TableCell>{appt.patientName}</TableCell>
                      <TableCell className="capitalize">{appt.type.replace(/_/g, " ")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{appt.status.replace(/_/g, " ")}</Badge>
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
              <Button asChild variant="outline" size="sm"><Link href="/appointments">View All</Link></Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {data.recentAppointments.length === 0 ? (
              <p className="py-8 text-sm text-muted-foreground text-center">No appointments today yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentAppointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-medium">{appt.startTime.slice(0, 5)}</TableCell>
                      <TableCell>{appt.patientName}</TableCell>
                      <TableCell>{appt.doctorName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{appt.status.replace(/_/g, " ")}</Badge>
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
        <MetricCard title="Today's Invoices" value={data.todayInvoices} detail="Created today" icon={FileText} trend="Daily close" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Status Overview</CardTitle>
          <CardDescription>Breakdown of invoice payment statuses across the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(data.payStatusCounts).length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground text-center">No invoices yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(data.payStatusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg border bg-background/70 px-4 py-3">
                  <span className="text-sm font-medium capitalize">{status}</span>
                  <span className="text-lg font-bold">{count as number}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href={"/billing/patients" as any}>View All Invoices</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function HeroSignal({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex min-h-16 items-center gap-3 border-b px-5 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border bg-background text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function MetricCard({ title, value, detail, icon: Icon, trend }: { title: string; value: string | number; detail: string; icon: React.ComponentType<{ className?: string }>; trend: string }) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{title}</span>
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-3xl font-semibold tracking-normal">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
          <Badge variant="outline" className="mb-1">{trend}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function SignalCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 rounded-lg border bg-background/70 px-4 py-3">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold">{value}</span>
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
          <p className="rounded-lg border bg-background/70 px-4 py-3 text-sm text-muted-foreground">{emptyLabel}</p>
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
          <p className="rounded-lg border bg-background/70 px-4 py-3 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {entries.map(([status, count]) => (
              <Badge key={status} variant="outline" className="capitalize">
                {status.replace(/_/g, " ")}: {count}
              </Badge>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function ProgressRow({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} />
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity, Ambulance, CalendarCheck2, Clock, CreditCard, DollarSign, FileText, KeyRound, Plus, ShieldCheck, Stethoscope, Timer, UserRoundCheck, UsersRound
} from "lucide-react";
import { requirePagePermission } from "@/lib/auth";
import { dashboardService } from "@modules/dashboard/services/dashboard.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 capitalize">{session.role} workspace</Badge>
          <h1 className="text-2xl font-semibold tracking-normal">
            {session.role === "admin" ? "Clinic Command Center" :
             session.role === "doctor" ? "My Practice Dashboard" :
             session.role === "receptionist" ? "Front Desk Dashboard" :
             "Billing & Finance Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.role === "admin" ? `Welcome back, ${session.name}. Live overview for doctors, staff, access, and appointment capacity.` :
             session.role === "doctor" ? `Welcome back, Dr. ${session.name}. Your schedule and patient activity at a glance.` :
             session.role === "receptionist" ? `Welcome back, ${session.name}. Today's appointments, queue, and walk-ins.` :
             `Welcome back, ${session.name}. Revenue, invoices, and payment tracking for today.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.role === "admin" && (
            <>
              <Button asChild>
                <Link href="/doctors/add"><Plus className="h-4 w-4 mr-1" />Add Doctor</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/settings/staff-manage/create"><Plus className="h-4 w-4 mr-1" />Add Staff</Link>
              </Button>
            </>
          )}
          {session.role === "receptionist" && (
            <Button asChild>
              <Link href="/appointments"><CalendarCheck2 className="h-4 w-4 mr-1" />Manage Appointments</Link>
            </Button>
          )}
          {session.role === "accountant" && (
            <Button asChild>
              <Link href={"/billing/patients" as any}><DollarSign className="h-4 w-4 mr-1" />View Billing</Link>
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
  const apptStatusCounts = data.todayStatusCounts;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Doctors" value={data.metrics.doctors} detail={`${data.metrics.availableDoctors} available`} icon={Stethoscope} />
        <MetricCard title="Staff" value={data.metrics.staff} detail="Active clinic team profiles" icon={UsersRound} />
        <MetricCard title="Today's Appointments" value={data.metrics.todayAppointments} detail="Scheduled for today" icon={CalendarCheck2} />
        <MetricCard title="Total Patients" value={data.metrics.patients} detail="Registered patients" icon={Activity} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active Sessions" value={data.metrics.activeSessions} detail="Secure logins" icon={KeyRound} />
        <MetricCard title="Upcoming Slots" value={data.metrics.upcomingSlots} detail="Open for booking" icon={Timer} />
        <MetricCard title="RBAC Roles" value={data.metrics.roles} detail="Access control roles" icon={ShieldCheck} />
        <MetricCard title="Specialties" value={data.metrics.specialties} detail="Medical specialties" icon={UserRoundCheck} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.8fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Operational Health</CardTitle>
            <CardDescription>Capacity and setup status for the current workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ProgressRow label="Doctor availability" value={availabilityRate} caption={`${data.metrics.availableDoctors}/${data.metrics.doctors} doctors available`} />
            <div>
              <h4 className="text-sm font-medium mb-3">Today's Appointment Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(apptStatusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded-lg border bg-background/70 px-3 py-2 text-sm">
                    <span className="capitalize">{status.replace(/_/g, " ")}</span>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
                {Object.keys(apptStatusCounts).length === 0 && (
                  <p className="col-span-2 text-sm text-muted-foreground py-2">No appointments today.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Recent Doctors</CardTitle>
              <CardDescription>Latest doctor profiles and availability state.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm"><Link href="/doctors">View All</Link></Button>
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
        <MetricCard title="Today's Appointments" value={data.todayAppointments} detail="Scheduled for today" icon={CalendarCheck2} />
        <MetricCard title="Checked-in Now" value={data.checkedInNow} detail="Waiting for consultation" icon={Clock} />
        <MetricCard title="Completed Today" value={data.completedToday} detail="Successfully done" icon={Activity} />
        <MetricCard title="Total Patients" value={data.totalPatients} detail="Across all appointments" icon={UsersRound} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Your availability and consultation info.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-background/70 px-4 py-3">
              <span className="text-sm font-medium">Availability</span>
              <Badge variant={data.isAvailable ? "default" : "outline"}>{data.isAvailable ? "Available" : "Unavailable"}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-background/70 px-4 py-3">
              <span className="text-sm font-medium">Specialty</span>
              <span className="text-sm font-semibold">{data.specialty}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-background/70 px-4 py-3">
              <span className="text-sm font-medium">Consultation Fee</span>
              <span className="text-sm font-semibold">${data.consultationFee}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-background/70 px-4 py-3">
              <span className="text-sm font-medium">Status Breakdown</span>
              <span className="text-sm text-muted-foreground">
                {Object.entries(appointmentStatusCounts).map(([s, c]) => `${s}: ${c}`).join(", ") || "None"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your appointments for today.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm"><Link href="/appointments">Full Calendar</Link></Button>
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
        <MetricCard title="Today's Appointments" value={data.todayAppointments} detail="Scheduled today" icon={CalendarCheck2} />
        <MetricCard title="Checked-in" value={checkedIn} detail="Waiting for doctor" icon={Clock} />
        <MetricCard title="Confirmed" value={confirmed} detail="Upcoming appointments" icon={Activity} />
        <MetricCard title="Total Patients" value={data.patients} detail="Registered in system" icon={UsersRound} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Today at a Glance</CardTitle>
            <CardDescription>Quick stats for front desk operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-background/70 px-4 py-3">
              <span className="text-sm font-medium">Doctors On Duty</span>
              <span className="text-lg font-bold">{data.doctors}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-background/70 px-4 py-3">
              <span className="text-sm font-medium">Completed</span>
              <span className="text-lg font-bold">{completed}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-background/70 px-4 py-3">
              <span className="text-sm font-medium">Walk-ins / Other</span>
              <span className="text-lg font-bold">{(data.statusCounts["booked"] || 0) + (data.statusCounts["walk_in"] || 0)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-background/70 px-4 py-3">
              <span className="text-sm font-medium">Cancelled / No-show</span>
              <span className="text-lg font-bold">{(data.statusCounts["cancelled"] || 0) + (data.statusCounts["no_show"] || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Latest appointments booked or checked-in today.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm"><Link href="/appointments">View All</Link></Button>
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
        <MetricCard title="Today's Revenue" value={`$${data.todayRevenue.toFixed(2)}`} detail="Collected today" icon={DollarSign} />
        <MetricCard title="Pending Invoices" value={data.pendingInvoices} detail="Awaiting payment" icon={FileText} />
        <MetricCard title="Total Invoices" value={data.totalInvoices} detail="All time" icon={CreditCard} />
        <MetricCard title="Today's Invoices" value={data.todayInvoices} detail="Created today" icon={FileText} />
      </div>

      <Card className="rounded-lg">
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

function MetricCard({ title, value, detail, icon: Icon }: { title: string; value: string | number; detail: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </CardContent>
    </Card>
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

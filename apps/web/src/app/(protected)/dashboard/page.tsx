import { Activity, CalendarDays, CreditCard, TrendingUp, Users } from "lucide-react";

const stats = [
  {
    title: "Total Patients",
    value: "1,248",
    icon: Users,
    growth: "+12%",
  },
  {
    title: "Appointments",
    value: "86",
    icon: CalendarDays,
    growth: "+8%",
  },
  {
    title: "Revenue",
    value: "$12,420",
    icon: CreditCard,
    growth: "+18%",
  },
  {
    title: "AI Notes",
    value: "342",
    icon: Activity,
    growth: "+24%",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>

        <p className="text-sm text-muted-foreground">Welcome back. Here’s your clinic overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>

                <h2 className="mt-3 text-3xl font-semibold text-foreground">{item.value}</h2>
              </div>

              <div className="rounded-md bg-primary/10 p-3 text-primary">
                <item.icon className="size-5" />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-emerald-600">
              <TrendingUp className="size-4" />
              {item.growth} this month
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Today Appointments</h3>

              <p className="text-sm text-muted-foreground">Upcoming patient visits</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                patient: "John Doe",
                doctor: "Dr. Smith",
                time: "09:30 AM",
              },
              {
                patient: "Emma Watson",
                doctor: "Dr. Brown",
                time: "11:00 AM",
              },
              {
                patient: "Michael Lee",
                doctor: "Dr. Wilson",
                time: "01:15 PM",
              },
            ].map((appointment) => (
              <div
                key={appointment.patient}
                className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h4 className="font-medium text-foreground">{appointment.patient}</h4>

                  <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                </div>

                <div className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  {appointment.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/10 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-md bg-primary p-3 text-primary-foreground">
              <Activity className="size-5" />
            </div>

            <div>
              <h3 className="font-semibold text-foreground">AI Summary</h3>

              <p className="text-sm text-muted-foreground">Generated insights</p>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>Patient engagement increased by 18% this week.</p>

            <p>12 appointments are pending confirmation.</p>

            <p>AI notes automation reduced manual documentation by 30%.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

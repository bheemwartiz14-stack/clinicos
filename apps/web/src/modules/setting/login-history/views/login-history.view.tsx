import { CalendarDays, Monitor, Search, ShieldCheck, UserRound } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LoginHistoryPageModel } from "../login-history.types";

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getSessionStatus(expiresAt: Date | string) {
  return new Date(expiresAt).getTime() > Date.now() ? "Active" : "Expired";
}

export function LoginHistoryView({
  breadcrumb,
  description,
  logins,
  query,
  stats,
  title,
}: LoginHistoryPageModel) {
  const statCards = [
    { icon: Monitor, label: "Total logins", value: stats.totalLogins },
    { icon: CalendarDays, label: "Today", value: stats.todayLogins },
    { icon: ShieldCheck, label: "This week", value: stats.thisWeekLogins },
  ];

  return (
    <DashboardShell
      activeHref="/setting/audit-logs/login-history"
      breadcrumb={breadcrumb}
      title={title}
    >
      <div className="space-y-5">
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>

        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-lg border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Session history</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Recent successful login sessions.
              </p>
            </div>

            <form action="/setting/audit-logs/login-history" className="flex w-full gap-2 lg:w-96">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  defaultValue={query}
                  name="q"
                  placeholder="Search user, email, IP, device"
                  type="search"
                />
              </div>

              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>

          {logins.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Logged in</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {logins.map((login) => {
                  const status = getSessionStatus(login.expiresAt);

                  return (
                    <TableRow key={login.id}>
                      <TableCell>
                        <span className="inline-flex items-start gap-2">
                          <UserRound className="mt-0.5 size-3.5 text-muted-foreground" />
                          <span>
                            <span className="block font-medium text-foreground">
                              {login.userName}
                            </span>
                            <span className="block text-muted-foreground text-xs">
                              {login.userEmail}
                            </span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {login.ipAddress ?? "-"}
                      </TableCell>
                      <TableCell className="max-w-72 truncate text-muted-foreground">
                        {login.userAgent ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status === "Active" ? "default" : "outline"}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(login.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(login.expiresAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="grid min-h-56 place-items-center p-6 text-center">
              <div>
                <Monitor className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 font-medium text-foreground">No login history found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Login sessions will appear here after users sign in.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

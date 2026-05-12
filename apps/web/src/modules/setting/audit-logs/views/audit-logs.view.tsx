import { Activity, CalendarDays, Search, ShieldCheck, UserRound } from "lucide-react";
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
import type { AuditLogsPageModel } from "../audit-logs.types";

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function AuditLogsView({
  breadcrumb,
  description,
  logs,
  query,
  stats,
  title,
}: AuditLogsPageModel) {
  const statCards = [
    { icon: Activity, label: "Total logs", value: stats.totalLogs },
    { icon: CalendarDays, label: "Today", value: stats.todayLogs },
    { icon: ShieldCheck, label: "This week", value: stats.thisWeekLogs },
  ];

  return (
    <DashboardShell activeHref="/setting/audit-logs" breadcrumb={breadcrumb} title={title}>
      <div className="space-y-5">
        <div>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <span className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Activity history</h2>
              <p className="mt-1 text-sm text-muted-foreground">Latest system and user activity.</p>
            </div>

            <form action="/setting/audit-logs" className="flex w-full gap-2 lg:w-80">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  defaultValue={query}
                  name="q"
                  placeholder="Search logs"
                  type="search"
                />
              </div>

              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>

          {logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{log.action}</p>
                        {log.description ? (
                          <p className="text-xs text-muted-foreground">{log.description}</p>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{log.module}</Badge>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <UserRound className="size-3.5" />
                        {log.userName ?? "System"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid min-h-56 place-items-center p-6 text-center">
              <div>
                <Activity className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 font-medium text-foreground">No activity logs found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Logs will appear here when users perform actions.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

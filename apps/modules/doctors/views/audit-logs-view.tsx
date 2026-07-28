"use client";

import { Shield, Filter, Download, Search, Activity, UserCheck, AlertTriangle, LogIn, LogOut, Plus, Pencil, Trash2 } from "lucide-react";
import type { AuditLogRecord } from "@modules/auditlog/audit-logs.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const actionMeta: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  create: { label: "Create", icon: Plus, color: "border-green-200 bg-green-50 text-green-700" },
  update: { label: "Update", icon: Pencil, color: "border-blue-200 bg-blue-50 text-blue-700" },
  delete: { label: "Delete", icon: Trash2, color: "border-red-200 bg-red-50 text-red-700" },
  login: { label: "Login", icon: LogIn, color: "border-purple-200 bg-purple-50 text-purple-700" },
  logout: { label: "Logout", icon: LogOut, color: "border-gray-200 bg-gray-50 text-gray-600" },
};

const ACTION_ICONS: Record<string, typeof Shield> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  login: LogIn,
  logout: LogOut,
};

const ACTION_COLORS: Record<string, string> = {
  create: "from-green-500/10 to-green-500/5 text-green-600 ring-green-500/20",
  update: "from-blue-500/10 to-blue-500/5 text-blue-600 ring-blue-500/20",
  delete: "from-red-500/10 to-red-500/5 text-red-600 ring-red-500/20",
  login: "from-purple-500/10 to-purple-500/5 text-purple-600 ring-purple-500/20",
  logout: "from-gray-500/10 to-gray-500/5 text-gray-600 ring-gray-500/20",
};

function getActionColor(action: string) {
  return ACTION_COLORS[action.toLowerCase()] ?? "from-primary/10 to-primary/5 text-primary ring-primary/20";
}

function getActionIcon(action: string) {
  return ACTION_ICONS[action.toLowerCase()] ?? Shield;
}

const UNIQUE_ENTITIES = ["User", "Patient", "Appointment", "Doctor", "Invoice", "System"];

export function AuditLogsView({ logs: initialLogs }: { logs: AuditLogRecord[] }) {
  const uniqueActions = new Set(initialLogs.map((l) => l.action.toLowerCase())).size;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
              System Audit
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">
              System activity and change tracking.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
              <Activity className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold tabular-nums">{initialLogs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-600">
              <AlertTriangle className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Action Types</p>
              <p className="text-2xl font-bold tabular-nums">{uniqueActions}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600">
              <UserCheck className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold tabular-nums">{new Set(initialLogs.map((l) => l.userId)).size}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search audit logs..." className="h-11 border bg-muted/50 pl-10 text-base focus-visible:bg-background" />
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <CardContent className="p-0">
          {initialLogs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted">
                <Shield className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No audit logs found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                System activity will appear here as actions are performed across the platform.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {initialLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                const color = getActionColor(log.action);
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/10">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${color} ring-1`}>
                      <ActionIcon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{log.userName ?? "System"}</span>
                        <Badge variant="secondary" className={actionMeta[log.action.toLowerCase()]?.color ?? "border-gray-200 bg-gray-50 text-gray-600"}>
                          {log.action}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{log.entity}</span>
                        {log.entityId && (
                          <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                            {log.entityId.slice(0, 8)}...
                          </code>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                        {log.ipAddress && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span>{log.ipAddress}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

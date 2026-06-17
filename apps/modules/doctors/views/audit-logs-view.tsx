"use client";

import { Shield, Filter, Download, Search } from "lucide-react";
import type { AuditLogRecord } from "@modules/auditlog/audit-logs.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const actionColors: Record<string, string> = {
  create: "bg-green-500/10 text-green-500",
  update: "bg-blue-500/10 text-blue-500",
  delete: "bg-red-500/10 text-red-500",
  login: "bg-purple-500/10 text-purple-500",
  logout: "bg-gray-500/10 text-gray-500",
};

export function AuditLogsView({ logs: initialLogs }: { logs: AuditLogRecord[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">System activity and change tracking</p>
          </div>
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search audit logs..." className="pl-9" />
      </div>

      <Card className="backdrop-blur-sm bg-card/60">
        <CardContent className="p-0">
          <div className="divide-y">
            {initialLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                <div className="rounded-full bg-primary/10 p-2 shrink-0">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{log.userName ?? "System"}</span>
                    <Badge variant="secondary" className={actionColors[log.action.toLowerCase()] ?? ""}>
                      {log.action}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{log.entity}</span>
                    {log.entityId && (
                      <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {log.entityId.slice(0, 8)}...
                      </code>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(log.createdAt).toLocaleString()}
                    {log.ipAddress && ` • ${log.ipAddress}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {initialLogs.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Shield className="h-12 w-12" />
          <p className="font-medium">No audit logs found</p>
          <p className="text-sm">System activity will appear here as actions are performed</p>
        </div>
      )}
    </div>
  );
}

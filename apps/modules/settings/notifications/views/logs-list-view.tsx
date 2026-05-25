"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Search,
  Smartphone,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NotificationLogRecord, PaginatedResult } from "../services/notification-log.service";

const channelIcon: Record<string, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Smartphone,
  system: Mail,
};

const channelLabel: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  system: "System",
};

const statusConfig: Record<
  string,
  { icon: typeof Clock; class: string }
> = {
  queued: { icon: Clock, class: "border-blue-200 bg-blue-50 text-blue-700" },
  sent: { icon: CheckCircle2, class: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  failed: { icon: XCircle, class: "border-red-200 bg-red-50 text-red-700" },
  cancelled: { icon: AlertCircle, class: "border-gray-200 bg-gray-50 text-gray-500" },
};

export function NotificationLogsView({
  result,
}: {
  result: PaginatedResult<NotificationLogRecord>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentChannel = searchParams.get("channel") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentQ = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      if (updates.channel !== undefined || updates.status !== undefined || updates.q !== undefined) {
        params.delete("page");
      }
      router.push(`/settings/notifications/logs?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notification Logs</h1>
        <p className="text-sm text-muted-foreground">
          View all sent, queued, and failed notifications.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              defaultValue={currentQ}
              placeholder="Search by recipient, subject, or body..."
              onChange={(e) => {
                const value = e.target.value;
                const timer = setTimeout(() => updateFilters({ q: value }), 300);
                return () => clearTimeout(timer);
              }}
              className="h-11 border bg-muted/50 pl-12 text-base focus-visible:bg-background"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Channel:</span>
            {["", "email", "sms", "whatsapp", "system"].map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => updateFilters({ channel: ch })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  currentChannel === ch
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {ch ? channelLabel[ch] ?? ch : "All"}
              </button>
            ))}

            <span className="ml-2 text-xs font-medium text-muted-foreground">Status:</span>
            {["", "queued", "sent", "failed", "cancelled"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => updateFilters({ status: st })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  currentStatus === st
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {st ? st.charAt(0).toUpperCase() + st.slice(1) : "All"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-5 py-4 font-semibold">Recipient</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Template</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Channel</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Status</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((log) => {
                const StatusIcon = statusConfig[log.status]?.icon ?? Clock;
                const ChanIcon = channelIcon[log.channel] ?? Mail;
                return (
                  <TableRow key={log.id} className="group">
                    <TableCell className="px-5 py-4">
                      <div className="font-medium">{log.recipient}</div>
                      {log.subject ? (
                        <div className="truncate text-xs text-muted-foreground max-w-[200px]">
                          {log.subject}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm">
                      {log.templateName ?? (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge variant="outline" className="gap-1.5">
                        <ChanIcon className="h-3 w-3" />
                        {channelLabel[log.channel] ?? log.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge className={statusConfig[log.status]?.class ?? ""}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {log.status}
                      </Badge>
                      {log.error && log.status === "failed" ? (
                        <div className="mt-1 max-w-[180px] truncate text-[10px] text-red-500">
                          {log.error}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-xs text-muted-foreground tabular-nums">
                      {log.sentAt
                        ? new Date(log.sentAt).toLocaleString()
                        : log.createdAt
                          ? new Date(log.createdAt).toLocaleString()
                          : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {result.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-muted">
                <Mail className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No notification logs</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentQ || currentChannel || currentStatus
                  ? "Try adjusting your filters."
                  : "Notifications will appear here once they are sent."}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
              <span>
                Showing {(result.page - 1) * result.pageSize + 1}–
                {Math.min(result.page * result.pageSize, result.total)} of {result.total}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={result.page <= 1}
                  onClick={() => updateFilters({ page: String(result.page - 1) })}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={result.page >= result.totalPages}
                  onClick={() => updateFilters({ page: String(result.page + 1) })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

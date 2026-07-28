"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle2, XCircle, Loader2, ExternalLink, Unlink, RefreshCw, AlertTriangle, Clock, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getGoogleCalendarStatusAction, disconnectGoogleCalendarAction, connectGoogleCalendarAction } from "@modules/integrations/google-calendar/actions/google-calendar.actions";

type Props = {
  userId: string;
};

type ConnectionStatus = {
  isConnected: boolean;
  email: string | null;
  calendarId: string | null;
  verificationError?: string | null;
};

export default function GoogleIntegrationClient({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getGoogleCalendarStatusAction(userId);
      setStatus(data);
    } catch {
      console.error("Failed to fetch Google Calendar status");
    } finally {
      setStatusLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const connectGoogle = async () => {
    try {
      setLoading(true);
      const url = await connectGoogleCalendarAction(userId);
      window.location.href = url;
    } catch (err) {
      toast.error("Failed to connect Google Calendar");
      console.error("Google connect error:", err);
    } finally {
      setLoading(false);
    }
  };

  const disconnectGoogle = async () => {
    try {
      setLoading(true);
      await disconnectGoogleCalendarAction(userId);
      setStatus({ isConnected: false, email: null, calendarId: null });
      toast.success("Google Calendar disconnected successfully");
    } catch (err) {
      toast.error("Failed to disconnect Google Calendar");
      console.error("Google disconnect error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[180px] w-full rounded-2xl" />
        <Skeleton className="h-[320px] w-full rounded-xl" />
      </div>
    );
  }

  const isConnected = status?.isConnected && !status?.verificationError;
  const needsReauth = !!status?.verificationError;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
              Integrations
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">Google Calendar</h1>
            <p className="text-sm text-muted-foreground">
              Sync appointments automatically with Google Calendar.
            </p>
          </div>
          <Badge
            variant={isConnected ? "default" : needsReauth ? "destructive" : "secondary"}
            className={`gap-1.5 px-3 py-1.5 text-xs font-medium ${
              isConnected ? "bg-green-500/10 text-green-600 hover:bg-green-500/15" : ""
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isConnected
                  ? "bg-green-500 animate-pulse"
                  : needsReauth
                    ? "bg-destructive"
                    : "bg-muted-foreground"
              }`}
            />
            {isConnected ? "Connected" : needsReauth ? "Expired" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border shadow-sm lg:col-span-2">
          <CardHeader className="border-b bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Settings2 className="h-4 w-4" />
              </span>
              <div>
                <CardTitle>Connection Details</CardTitle>
                <CardDescription>
                  Status and configuration of your Google Calendar sync.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-5 py-3 font-semibold">Property</TableHead>
                  <TableHead className="px-5 py-3 font-semibold">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="px-5 py-3.5 font-medium">Status</TableCell>
                  <TableCell className="px-5 py-3.5">
                    <Badge
                      variant={isConnected ? "default" : needsReauth ? "destructive" : "secondary"}
                      className={`gap-1.5 text-xs ${
                        isConnected ? "bg-green-500/10 text-green-600" : ""
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${isConnected ? "bg-green-500" : needsReauth ? "bg-destructive" : "bg-muted-foreground"}`} />
                      {isConnected ? "Active" : needsReauth ? "Expired" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="px-5 py-3.5 font-medium">Account</TableCell>
                  <TableCell className="px-5 py-3.5 text-sm">{status?.email ?? "—"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="px-5 py-3.5 font-medium">Calendar ID</TableCell>
                  <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                    {status?.calendarId ?? "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="px-5 py-3.5 font-medium">Auto-sync</TableCell>
                  <TableCell className="px-5 py-3.5">
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Enabled
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </span>
              <div>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Manage your connection.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {isConnected ? (
              <div className="space-y-3">
                <div className="rounded-xl border bg-gradient-to-br from-green-50/50 to-transparent p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                      <CheckCircle2 className="size-4 text-green-500" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium text-foreground">Connected</p>
                      <p className="text-xs text-muted-foreground">Appointments are syncing to your Google Calendar.</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={fetchStatus} title="Refresh status" className="shrink-0">
                    <RefreshCw className="size-4" />
                  </Button>
                  <Button variant="destructive" className="flex-1 gap-2" onClick={disconnectGoogle} disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Unlink className="size-4" />}
                    {loading ? "Disconnecting..." : "Disconnect"}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  This will revoke access and remove all synced event data.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border bg-gradient-to-br from-muted/50 to-transparent p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted-foreground/10">
                      <XCircle className="size-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Not connected</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Connect your Google account to enable automatic appointment syncing.
                      </p>
                    </div>
                  </div>
                </div>
                <Button className="w-full gap-2" onClick={connectGoogle} disabled={loading}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
                  {loading ? "Connecting..." : "Connect Google Calendar"}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  You will be redirected to Google to authorize this application.
                </p>
              </div>
            )}

            {needsReauth && (
              <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-transparent p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <AlertTriangle className="size-4 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-700">Reconnection Required</p>
                    <p className="text-xs text-amber-600">{status?.verificationError}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle2, XCircle, Loader2, ExternalLink, Unlink, RefreshCw, AlertTriangle, Clock } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-[280px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const isConnected = status?.isConnected && !status?.verificationError;
  const needsReauth = !!status?.verificationError;

  return (
    <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg card-hover">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
                <Calendar className="size-6 text-primary" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl">Google Calendar</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Sync appointments automatically with Google Calendar
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={isConnected ? "default" : needsReauth ? "destructive" : "secondary"}
              className={`gap-1.5 px-3 py-1 text-xs font-medium ${
                isConnected ? "bg-green-500/10 text-green-600 hover:bg-green-500/15 dark:bg-green-500/15 dark:text-green-400" : ""
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
        </CardHeader>

        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/10">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                    <CheckCircle2 className="size-4 text-green-500" />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-sm font-medium text-foreground">Connected to Google Calendar</p>
                    <p className="text-xs text-muted-foreground">
                      {status?.email
                        ? `Authorized as ${status.email}`
                        : "Authorized for calendar sync"}
                    </p>
                  </div>
                </div>
                {status?.calendarId && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-background/80 px-3 py-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5 shrink-0 text-muted-foreground/60" />
                    <span className="font-medium">Calendar ID:</span>
                    <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground/80">
                      {status.calendarId}
                    </code>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-transparent">
              <div className="p-4">
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
            </div>
          )}

          {needsReauth && (
            <div className="overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-transparent dark:border-amber-800 dark:from-amber-950/10">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <AlertTriangle className="size-4 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Reconnection Required
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {status?.verificationError}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-lg font-semibold tracking-tight">Auto</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Sync</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-lg font-semibold tracking-tight">Real-time</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Updates</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-lg font-semibold tracking-tight">2-way</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Sync</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3 pt-2">
          {isConnected ? (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={fetchStatus}
                title="Refresh status"
                className="shrink-0"
              >
                <RefreshCw className="size-4" />
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={disconnectGoogle}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Unlink className="size-4" />
                )}
                {loading ? "Disconnecting..." : "Disconnect Google Calendar"}
              </Button>
            </div>
          ) : (
            <Button className="w-full gap-2" onClick={connectGoogle} disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ExternalLink className="size-4" />
              )}
              {loading ? "Connecting..." : "Connect Google Calendar"}
            </Button>
          )}
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            {isConnected
              ? "This will revoke access and remove all synced event data."
              : "You will be redirected to Google to authorize this application."}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

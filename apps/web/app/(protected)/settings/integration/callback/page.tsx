"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  exchangeGoogleCodeAction,
  createGoogleCalendarAction,
} from "@modules/integrations/google-calendar/actions/google-calendar.actions";

type StepState = "pending" | "processing" | "completed" | "error";

type Step = {
  label: string;
  state: StepState;
  errorMessage?: string;
};

const initialSteps: Step[] = [
  { label: "Generating access token & refresh token", state: "pending" },
  { label: "Saving in the database", state: "pending" },
  { label: "Creating & getting the calendar", state: "pending" },
  { label: "Saving calendar in the database", state: "pending" },
];

function StepIndicator({ step, index }: { step: Step; index: number }) {
  const icon = () => {
    switch (step.state) {
      case "completed":
        return <CheckCircle2 className="size-5 text-green-500 shrink-0" />;
      case "error":
        return <XCircle className="size-5 text-red-500 shrink-0" />;
      case "processing":
        return <Loader2 className="size-5 text-primary shrink-0 animate-spin" />;
      default:
        return (
          <div className="size-5 shrink-0 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
            <div className="size-2 rounded-full bg-muted-foreground/30" />
          </div>
        );
    }
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors duration-300 ${
        step.state === "processing"
          ? "border-primary/40 bg-primary/5"
          : step.state === "completed"
            ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
            : step.state === "error"
              ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
              : "bg-muted/30"
      }`}
    >
      <div className="mt-0.5">{icon()}</div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            step.state === "pending"
              ? "text-muted-foreground/50"
              : step.state === "completed"
                ? "text-green-700 dark:text-green-300"
                : step.state === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-foreground"
          }`}
        >
          {step.label}
        </p>
        {step.state === "processing" && (
          <p className="text-xs text-muted-foreground mt-0.5">In progress...</p>
        )}
        {step.state === "error" && step.errorMessage && (
          <p className="text-xs text-red-500 mt-0.5">{step.errorMessage}</p>
        )}
      </div>
      {step.state === "completed" && (
        <div className="size-2 shrink-0 rounded-full bg-green-500 animate-pulse" />
      )}
    </div>
  );
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const [overallStatus, setOverallStatus] = useState<"processing" | "success" | "error">("processing");
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const updateStep = (index: number, newState: StepState, errorMessage?: string) => {
    setSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], state: newState, errorMessage };
      return updated;
    });
  };

  const processCallback = useCallback(async () => {
    setSteps(initialSteps);

    if (!code || !state) {
      setOverallStatus("error");
      setError("Missing required parameters. Please try connecting again.");
      return;
    }

    try {
      updateStep(0, "processing");
      const { userId } = await exchangeGoogleCodeAction(code, state);
      updateStep(0, "completed");

      updateStep(1, "completed");

      updateStep(2, "processing");
      await createGoogleCalendarAction(userId);
      updateStep(2, "completed");

      updateStep(3, "completed");

      setOverallStatus("success");
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setOverallStatus("error");
      const message = err instanceof Error ? err.message : "Failed to connect Google Calendar.";
      setError(message);

      const currentSteps = stepsRef.current;
      const failedIdx = currentSteps.findIndex((s) => s.state === "processing");
      if (failedIdx !== -1) {
        updateStep(failedIdx, "error", message);
      }
    }
  }, [code, state, router]);

  useEffect(() => {
    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countdown === 0 && overallStatus === "success") {
      router.push("/settings/integration");
    }
  }, [countdown, overallStatus, router]);

  if (overallStatus === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Connected Successfully</CardTitle>
          <CardDescription>
            Your Google Calendar is now linked to Clinicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {steps.map((step, i) => (
              <StepIndicator key={i} step={step} index={i} />
            ))}
          </div>
          <div className="rounded-lg border bg-green-50/50 dark:bg-green-950/20 p-4">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="size-4 text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-green-700 dark:text-green-300">
                Appointments will now sync to your Google Calendar automatically.
              </span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Redirecting to settings in {countdown}s
          </p>
        </CardContent>
      </Card>
    );
  }

  if (overallStatus === "error") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <XCircle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>Connection Failed</CardTitle>
          <CardDescription>
            {error ?? "Something went wrong. Please try again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {steps.map((step, i) => (
              <StepIndicator key={i} step={step} index={i} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full"
              onClick={() => { setOverallStatus("processing"); processCallback(); }}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/settings/integration")}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
        <CardTitle>Connecting Calendar</CardTitle>
        <CardDescription>
          Setting up your Google Calendar integration...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {steps.map((step, i) => (
            <StepIndicator key={i} step={step} index={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function GoogleCalendarCallbackPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 sm:p-6 lg:p-8">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
              <CardTitle>Connecting Calendar</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Hash, User, CheckCircle2, XCircle, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { updateAppointmentStatusAction } from "../actions/appointment.actions";
import type { DoctorOption } from "../types/appointment.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/form-controls";

const STATUS_STYLES: Record<string, string> = {
  booked: "bg-slate-100 text-slate-700 border-slate-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  checked_in: "bg-blue-100 text-blue-700 border-blue-200",
  in_consultation: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  no_show: "bg-gray-100 text-gray-500 border-gray-200",
};

type QueueItem = {
  id: string;
  tokenNumber: number | null;
  patientName: string;
  startTime: string;
  status: string;
};

export function AppointmentQueueView({
  doctors,
  queue,
  currentDate,
  selectedDoctorId,
}: {
  doctors: DoctorOption[];
  queue: QueueItem[];
  currentDate: string;
  selectedDoctorId: string;
}) {
  const router = useRouter();
  const activeItems = queue.filter((q) => q.status !== "completed" && q.status !== "cancelled" && q.status !== "no_show");
  const completedItems = queue.filter((q) => q.status === "completed" || q.status === "cancelled" || q.status === "no_show");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appointment Queue</h1>
        <p className="text-sm text-muted-foreground">Live queue management for {currentDate}.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedDoctorId}
          onChange={(e) => router.push(`/appointments/queue?doctorId=${e.target.value}&date=${currentDate}`)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name} ({d.specialty ?? "General"})</option>
          ))}
        </select>
        <input
          type="date"
          value={currentDate}
          onChange={(e) => router.push(`/appointments/queue?doctorId=${selectedDoctorId}&date=${e.target.value}`)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-blue-600" />
              Active Queue ({activeItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activeItems.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">No active patients in queue.</div>
            ) : (
              <div className="divide-y">
                {activeItems.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {item.tokenNumber ? String(item.tokenNumber).padStart(2, "0") : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.patientName}</span>
                        <Badge className={STATUS_STYLES[item.status] || ""}>{item.status.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.startTime}</p>
                    </div>
                    <div className="flex gap-1">
                      {item.status === "confirmed" && (
                        <form action={updateAppointmentStatusAction}>
                          <input type="hidden" name="appointmentId" value={item.id} />
                          <input type="hidden" name="newStatus" value="checked_in" />
                          <Button type="submit" variant="outline" size="sm"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Check In</Button>
                        </form>
                      )}
                      {item.status === "checked_in" && (
                        <form action={updateAppointmentStatusAction}>
                          <input type="hidden" name="appointmentId" value={item.id} />
                          <input type="hidden" name="newStatus" value="in_consultation" />
                          <Button type="submit" variant="outline" size="sm"><ArrowRight className="h-3.5 w-3.5 mr-1" />Start</Button>
                        </form>
                      )}
                      {item.status === "in_consultation" && (
                        <form action={updateAppointmentStatusAction}>
                          <input type="hidden" name="appointmentId" value={item.id} />
                          <input type="hidden" name="newStatus" value="completed" />
                          <Button type="submit" variant="outline" size="sm"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Complete</Button>
                        </form>
                      )}
                      <Link href={`/appointments/${item.id}`} className="text-xs text-muted-foreground hover:underline self-center ml-2">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Hash className="h-4 w-4 text-muted-foreground" />
              Completed / Closed ({completedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {completedItems.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">No completed items.</div>
            ) : (
              <div className="divide-y">
                {completedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3 opacity-60">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {item.tokenNumber ? String(item.tokenNumber).padStart(2, "0") : "—"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{item.patientName}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

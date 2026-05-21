export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
  detail: string;
  tone: "neutral" | "success" | "warning";
};

export type DashboardAppointment = {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  status: string;
};

export type DashboardData = {
  metrics: DashboardMetric[];
  appointments: DashboardAppointment[];
  aiSummary: string[];
  pendingConfirmations: number;
};

export type DashboardStat = {
  title: string;
  value: string;
};

export type TodayAppointment = {
  patient: string;
  doctor: string;
  time: string;
};

export type AiInsight = {
  text: string;
};

export type DashboardPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  stats: DashboardStat[];
  todayAppointments: TodayAppointment[];
  aiInsights: AiInsight[];
};
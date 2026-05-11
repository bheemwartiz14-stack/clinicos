export type LoginHistoryListItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
};

export type LoginHistoryStats = {
  totalLogins: number;
  todayLogins: number;
  thisWeekLogins: number;
};

export type LoginHistoryPageSearchParams = {
  q?: string;
};

export type LoginHistoryPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  logins: LoginHistoryListItem[];
  stats: LoginHistoryStats;
  query: string;
};

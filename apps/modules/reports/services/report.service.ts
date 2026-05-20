export type DashboardReport = {
  branchId: string;
  visitsToday: number;
  outstandingBalanceCents: number;
  noShowRate: number;
};

export async function getDashboardReport(branchId: string): Promise<DashboardReport> {
  return {
    branchId,
    visitsToday: 0,
    outstandingBalanceCents: 0,
    noShowRate: 0
  };
}

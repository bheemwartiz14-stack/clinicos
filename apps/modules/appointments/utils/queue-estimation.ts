const priorityWeight: Record<any, number> = {
  emergency: 0,
  priority: 1,
  routine: 2
};
export function nextTokenNumber(currentCount: number, date = new Date()) {
  const day = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `Q-${day}-${String(currentCount + 1).padStart(3, "0")}`;
}
export function estimateQueuePosition(queue: any[], priority: any) {
  return queue.filter((entry) => priorityWeight[entry.priority] <= priorityWeight[priority]).length + 1;
}
export function estimateWaitMinutes(position: number, averageVisitMinutes = 15) {
  return Math.max(0, (position - 1) * averageVisitMinutes);
}

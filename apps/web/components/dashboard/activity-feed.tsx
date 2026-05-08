import { Badge } from "@mediclinicpro/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@mediclinicpro/ui/components/card";

const events = [
  ["AI summary generated", "Dr. Mehta completed Priya Raman visit note", "AI"],
  ["Invoice paid", "INV-2026-0042 settled by UPI", "Billing"],
  ["Stock alert", "Azithromycin batch expires in 18 days", "Inventory"],
  ["Queue update", "Room 2 ready for next consultation", "Ops"],
];

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity feed</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {events.map(([title, description, badge]) => (
          <div className="rounded-md border border-slate-100 p-3" key={title}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{title}</p>
              <Badge>{badge}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

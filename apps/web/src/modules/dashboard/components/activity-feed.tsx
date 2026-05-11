"use client";

import { Badge } from "@mediclinicpro/ui/components/badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@mediclinicpro/ui/components/card";

const events = [
  ["AI Summary Generated", "Dr. Mehta completed Priya Raman visit note", "AI"],
  ["Invoice Paid", "INV-2026-0042 settled by UPI", "Billing"],
  ["Stock Alert", "Azithromycin batch expires in 18 days", "Inventory"],
  ["Queue Update", "Room 2 ready for next consultation", "Ops"],
];

export function ActivityFeed() {
  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Activity Feed
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        {events.map(([title, description, badge]) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-muted/40 p-4 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-foreground">{title}</p>

              <Badge className="border-border bg-background text-foreground">
                {badge}
              </Badge>
            </div>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
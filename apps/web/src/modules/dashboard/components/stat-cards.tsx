import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@mediclinicpro/ui/components/card";

import type { DashboardStat } from "../dashboard.types";

type StatCardsProps = {
  stats: DashboardStat[];
};

export function StatCards({ stats }: StatCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="border-border bg-card text-card-foreground shadow-sm transition-colors"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
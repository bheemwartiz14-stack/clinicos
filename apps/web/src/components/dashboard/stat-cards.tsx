import { Card, CardContent, CardHeader, CardTitle } from "@mediclinicpro/ui/components/card";
import { formatCurrency } from "@mediclinicpro/utils";

const stats = [
  { label: "Active patients", value: "12,480", delta: "+8.4%" },
  { label: "Appointments today", value: "86", delta: "+12" },
  { label: "Monthly revenue", value: formatCurrency(1840000), delta: "+14.2%" },
  { label: "Queue wait", value: "11 min", delta: "-4 min" },
];

export function StatCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">{stat.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stat.value}</div>
            <div className="mt-1 text-sm text-teal-700">{stat.delta}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

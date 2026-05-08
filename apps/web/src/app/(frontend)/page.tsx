import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarCheck,
  CreditCard,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CalendarCheck,
    title: "Smart Appointments",
    description: "AI-powered booking, reminders and doctor scheduling.",
  },
  {
    icon: Users,
    title: "Patient EMR",
    description: "Digital patient records with instant history access.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Automate clinic workflows and patient communication.",
  },
  {
    icon: CreditCard,
    title: "Billing",
    description: "Invoices, payments and smart revenue tracking.",
  },
  {
    icon: FileText,
    title: "Prescriptions",
    description: "Digital prescriptions with medicine templates.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Clinic insights, reports and AI forecasting.",
  },
];

export default function HomePage() {
  return (
    <main className="relative w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl sm:h-[420px] sm:w-[420px]" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl sm:h-[420px] sm:w-[420px]" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl sm:h-[380px] sm:w-[380px]" />
      </div>

      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-24">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border bg-white/5 px-4 py-2 text-xs text-muted-foreground backdrop-blur-xl sm:text-sm">
              <Sparkles className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                AI-powered clinic management
              </span>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Modern AI Platform For{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Smart Clinics
                </span>
              </h1>

              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Manage appointments, EMR, billing, analytics and automation
                in one futuristic clinic ecosystem.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="h-12 w-full rounded-2xl px-6 text-sm sm:h-14 sm:px-8 sm:text-base">
                  Start Free Trial
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-2xl bg-white/5 px-6 text-sm backdrop-blur-xl sm:h-14 sm:px-8 sm:text-base"
                >
                  Login
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3 sm:gap-4 sm:pt-4">
              {[
                ["99%", "Uptime"],
                ["30%", "Workload Reduced"],
                ["24/7", "AI Support"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-3xl border bg-white/5 p-4 backdrop-blur-2xl sm:p-5"
                >
                  <div className="text-2xl font-bold sm:text-3xl">
                    {value}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full">
            <div className="relative w-full rounded-[24px] border bg-white/5 p-4 shadow-2xl backdrop-blur-2xl sm:rounded-[32px] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
                <div>
                  <h2 className="text-lg font-bold sm:text-xl">
                    Clinic Dashboard
                  </h2>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Real-time clinic insights
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl bg-primary/20 p-3 text-primary">
                  <Activity className="size-5 sm:size-6" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {[
                  {
                    icon: CalendarCheck,
                    title: "Appointments",
                    value: "42",
                  },
                  {
                    icon: Users,
                    title: "Patients",
                    value: "1.2K",
                  },
                  {
                    icon: CreditCard,
                    title: "Revenue",
                    value: "$12K",
                  },
                  {
                    icon: Bot,
                    title: "AI Tasks",
                    value: "87",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border bg-white/5 p-4 backdrop-blur-xl sm:p-5"
                  >
                    <item.icon className="mb-3 size-5 text-primary sm:mb-4 sm:size-6" />
                    <div className="text-2xl font-bold sm:text-3xl">
                      {item.value}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-4 backdrop-blur-xl sm:mt-5 sm:p-5">
                <div className="mb-3 flex items-start gap-3">
                  <div className="shrink-0 rounded-2xl bg-cyan-500/20 p-3 text-cyan-400">
                    <ShieldCheck className="size-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      AI Optimization
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Clinic efficiency increased by 30%
                    </p>
                  </div>
                </div>

                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-3 w-[78%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-medium text-primary">
            Features
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for modern healthcare
          </h2>

          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            Everything required to manage clinics with AI.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[24px] border bg-white/5 p-5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-500/30 sm:rounded-[32px] sm:p-8"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-primary/10 p-3 text-primary sm:mb-6 sm:p-4">
                <feature.icon className="size-6 sm:size-7" />
              </div>

              <h3 className="text-xl font-bold sm:text-2xl">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
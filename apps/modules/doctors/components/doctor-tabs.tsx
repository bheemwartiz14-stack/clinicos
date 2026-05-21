"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@mediclinic/ui";

const tabs = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Schedule", href: "/settings/my-schedule" },
  { label: "Slots", href: "/settings/my-slots" },
  { label: "Leave", href: "/settings/my-leaves" },
  { label: "Calendar", href: "/settings/my-calendar-sync" },
  { label: "AI", href: "/settings/my-appointments" }
];

export function DoctorTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border" aria-label="Doctor profile tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href as any}
          className={cn(
            "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition",
            pathname === tab.href ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

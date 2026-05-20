import type React from "react";
import { Sparkles } from "lucide-react";

export function AuthFormShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f9fc] px-5 py-12 text-[#02091a] sm:px-8 lg:px-12">
      <section className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-[880px] items-center gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:gap-16">
        <div className="mx-auto w-full max-w-[420px] lg:mx-0">
          <div className="mb-5 inline-flex h-8 items-center gap-2 rounded-full border border-[#d9e3ef] bg-white px-4 text-xs font-medium text-[#2a3850] shadow-[0_2px_3px_rgba(15,23,42,0.08)]">
            <Sparkles className="h-3.5 w-3.5 text-[#25bce8]" aria-hidden="true" />
            Smart clinic management workspace
          </div>

          <h1 className="max-w-[420px] text-[34px] font-black leading-[1.05] tracking-normal text-[#02091a] sm:text-[38px]">
            Manage your clinic with a modern dashboard.
          </h1>

          <p className="mt-5 max-w-[420px] text-sm leading-7 text-[#4f6482]">
            Secure login for doctors, admins, receptionists, billing teams and clinic staff.
          </p>

          <div className="mt-7 grid max-w-[420px] grid-cols-1 gap-3 sm:grid-cols-3">
            {["Patients", "Appointments", "Billing"].map((item) => (
              <div
                key={item}
                className="flex h-11 items-center rounded-2xl border border-[#dce5f0] bg-white px-4 text-xs font-medium text-[#27364d] shadow-[0_2px_4px_rgba(15,23,42,0.08)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[336px] rounded-[22px] border border-[#d9e3ef] bg-white/96 px-6 py-6 shadow-[0_20px_50px_rgba(34,82,130,0.08)] sm:px-7">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-[16px] bg-[#02091a] text-white shadow-sm">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-xl font-black tracking-normal text-[#02091a]">MediClinic Pro</p>
            <p className="mt-2 text-xs text-[#6f82a0]">{subtitle}</p>
          </div>

          {children}

          <p className="mt-5 text-center text-[11px] font-medium text-[#8a9ab1]">Protected access for clinic team members only.</p>
        </div>
      </section>
    </main>
  );
}

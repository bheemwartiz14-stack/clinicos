import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-lg shadow-slate-950/5">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-700">
          <ShieldAlert className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-slate-950">Access restricted</h1>
        <p className="mt-2 text-sm text-slate-600">Your account does not have permission to view this area.</p>
        <Link href="/login" className="mt-6 inline-flex h-10 items-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
          Sign in with another account
        </Link>
      </section>
    </main>
  );
}

import { Button } from "@mediclinicpro/ui/components/button";
import { Input } from "@mediclinicpro/ui/components/input";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold">Create clinic workspace</h1>
        <p className="mb-6 text-sm text-slate-500">
          Provision a tenant, admin account, and default roles.
        </p>
        <div className="grid gap-4">
          <Input name="clinic" placeholder="Clinic name" />
          <Input name="name" placeholder="Admin name" />
          <Input name="email" type="email" placeholder="admin@clinic.com" />
          <Input name="password" type="password" placeholder="Password" />
          <Button type="submit">Create workspace</Button>
        </div>
      </form>
    </main>
  );
}

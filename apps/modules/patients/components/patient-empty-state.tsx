import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PatientEmptyState({ canCreate }: { canCreate: boolean }) {
  return (
    <div className="grid min-h-72 place-items-center rounded-lg border border-dashed bg-card p-8 text-center">
      <div>
        <UserPlus className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
        <h2 className="mt-4 text-lg font-semibold">No patients found</h2>
        <p className="mt-2 text-sm text-muted-foreground">Create a patient profile to begin managing care records.</p>
        {canCreate ? <Button asChild className="mt-4"><Link href={"/patients/add" as any}>Add Patient</Link></Button> : null}
      </div>
    </div>
  );
}

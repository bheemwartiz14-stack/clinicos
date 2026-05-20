import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="mt-5 h-96 rounded-lg" />
    </div>
  );
}

import { Skeleton } from "@/app/components/shell/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-zinc-200 pb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

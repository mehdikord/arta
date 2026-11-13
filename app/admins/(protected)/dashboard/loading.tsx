import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6" aria-busy="true" aria-label="در حال بارگذاری داشبورد">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-10 w-72 rounded-xl" />
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-[26rem] rounded-2xl bg-slate-300/60 xl:col-span-8" />
        <div className="grid grid-cols-2 gap-4 xl:col-span-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-full min-h-32 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-72 rounded-2xl xl:col-span-5" />
        <Skeleton className="h-72 rounded-2xl xl:col-span-4" />
        <Skeleton className="h-72 rounded-2xl xl:col-span-3" />
      </div>
    </div>
  );
}

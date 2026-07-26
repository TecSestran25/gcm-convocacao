// src/app/admin/efetivo/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingEfetivo() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-12 w-32 rounded-md" />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full md:w-80 rounded-md" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <Skeleton className="h-10 w-full rounded-md mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md mb-2" />
        ))}
      </div>
    </div>
  )
}
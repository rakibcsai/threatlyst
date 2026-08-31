export function DashboardSkeleton() {
  return (
    <main
      className="p-5 md:p-7 xl:p-8"
      aria-busy="true"
      aria-label="Loading SOC dashboard"
    >
      <div className="mx-auto max-w-[1500px] animate-pulse">
        <div className="h-7 w-52 rounded bg-slate-800" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-900" />
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-36 rounded-xl border border-slate-800 bg-slate-900/50"
            />
          ))}
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-5">
          <div className="h-80 rounded-xl border border-slate-800 bg-slate-900/50 xl:col-span-3" />
          <div className="h-80 rounded-xl border border-slate-800 bg-slate-900/50 xl:col-span-2" />
        </div>
      </div>
    </main>
  )
}

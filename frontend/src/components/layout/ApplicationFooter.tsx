export function ApplicationFooter() {
  return (
    <footer className="border-t border-slate-800/70 bg-[#071019]/70 px-5 py-4 text-[11px] text-slate-600">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} ThreatLyst</p>
        <p>Security Operations Platform</p>
      </div>
    </footer>
  )
}

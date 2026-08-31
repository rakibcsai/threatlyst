import { ChevronLeft, LockKeyhole } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigation, plannedNavigation } from '../../config/navigation'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/cn'
import { Brand } from './Brand'

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
}: {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
}) {
  const { user } = useAuth()
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 -translate-x-full flex-col border-r border-slate-800/80 bg-[#09131d] transition-[transform,width] duration-200 lg:static lg:translate-x-0',
        mobileOpen && 'translate-x-0',
        collapsed ? 'lg:w-[76px]' : 'lg:w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
        <Brand compact={collapsed} />
        {!collapsed && (
          <button
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            onClick={onToggle}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-3" aria-label="Primary navigation">
        {!collapsed && (
          <p className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            Command
          </p>
        )}
        {navigation
          .filter((item) => user && item.roles.includes(user.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium',
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/15'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100',
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="size-[18px] shrink-0" />
              {!collapsed && item.label}
            </NavLink>
          ))}
        {!collapsed && (
          <div className="mt-6 rounded-lg border border-dashed border-slate-800 p-3 text-xs text-slate-600">
            <plannedNavigation.icon className="mb-2 size-4" />
            <span className="font-medium text-slate-500">
              {plannedNavigation.label}
            </span>
            <p className="mt-1 leading-5">
              Available in later approved phases.
            </p>
          </div>
        )}
      </nav>
      {collapsed && (
        <button
          onClick={onToggle}
          className="m-4 grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-800"
          aria-label="Expand sidebar"
        >
          <ChevronLeft className="size-4 rotate-180" />
        </button>
      )}
      {!collapsed && (
        <div className="m-3 flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
          <LockKeyhole className="size-4 text-emerald-400" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-300">
              Protected session
            </p>
            <p className="text-[10px] text-slate-600">Memory-only token</p>
          </div>
        </div>
      )}
    </aside>
  )
}

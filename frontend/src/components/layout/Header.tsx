import { LogOut, Menu, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Brand } from './Brand'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth()
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-[#08111a]/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-slate-200">
            Security Operations Center
          </p>
          <p className="text-xs text-slate-600">Threat intelligence overview</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400 sm:flex">
          <Shield className="size-3.5 text-cyan-400" />
          {user?.role}
        </span>
        <div className="hidden text-right md:block">
          <p className="text-xs font-semibold text-slate-200">
            {user?.username}
          </p>
          <p className="text-[11px] text-slate-600">{user?.email}</p>
        </div>
        <Button variant="ghost" onClick={logout} aria-label="Sign out">
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  )
}

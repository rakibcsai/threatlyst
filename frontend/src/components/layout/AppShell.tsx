import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  return <div className="flex min-h-screen bg-slate-950 text-slate-100"><Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onToggle={() => setCollapsed((value) => !value)} />{mobileOpen && <button className="fixed inset-0 z-30 bg-slate-950/75 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}<div className="min-w-0 flex-1"><Header onMenuClick={() => setMobileOpen(true)} /><Outlet /></div></div>
}

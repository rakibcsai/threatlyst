import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { ApplicationFooter } from './ApplicationFooter'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function AppShell({ children }: { children?: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  const closeMobileNavigation = useCallback(() => {
    if (!mobileOpen) return
    setMobileOpen(false)
    window.setTimeout(() => menuTriggerRef.current?.focus(), 0)
  }, [mobileOpen])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false)
    }
    desktop.addEventListener('change', closeAtDesktop)
    return () => desktop.removeEventListener('change', closeAtDesktop)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sidebarRef.current
      ?.querySelector<HTMLElement>('[data-mobile-close]')
      ?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMobileNavigation()
        return
      }
      if (event.key !== 'Tab' || !sidebarRef.current) return
      const focusable = Array.from(
        sidebarRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute('data-desktop-only'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeMobileNavigation, mobileOpen])

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        panelRef={sidebarRef}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((value) => !value)}
        onMobileClose={closeMobileNavigation}
        onNavigate={closeMobileNavigation}
      />
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/75 backdrop-blur-sm lg:hidden"
          onClick={closeMobileNavigation}
          aria-label="Close navigation"
          tabIndex={-1}
        />
      )}
      <div
        className="flex min-h-screen min-w-0 flex-1 flex-col"
        inert={mobileOpen ? true : undefined}
      >
        <Header
          menuButtonRef={menuTriggerRef}
          mobileOpen={mobileOpen}
          onMenuClick={() => setMobileOpen(true)}
        />
        <div className="min-w-0 flex-1">{children ?? <Outlet />}</div>
        <ApplicationFooter />
      </div>
    </div>
  )
}

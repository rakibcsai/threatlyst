import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

const focusableSelector =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function InvestigationDrawer({
  open,
  title,
  eyebrow,
  description,
  onClose,
  children,
}: {
  open: boolean
  title: string
  eyebrow: string
  description?: string
  onClose: () => void
  children: ReactNode
}) {
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      )
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
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
      previous?.focus()
    }
  }, [onClose, open])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="investigation-drawer-title"
    >
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label={`Close ${eyebrow.toLowerCase()}`}
      />
      <section
        ref={panelRef}
        className="relative h-full w-full max-w-3xl overflow-y-auto border-l border-slate-800 bg-[#07111a] shadow-2xl"
      >
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#07111a]/95 px-5 py-5 backdrop-blur sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-cyan-400">
                {eyebrow}
              </p>
              <h1
                id="investigation-drawer-title"
                className="mt-2 text-xl font-semibold text-white sm:text-2xl"
              >
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-xs text-slate-500">{description}</p>
              )}
            </div>
            <button
              ref={closeRef}
              className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              onClick={onClose}
              aria-label={`Close ${eyebrow.toLowerCase()}`}
            >
              <X className="size-5" />
            </button>
          </div>
        </header>
        <div className="space-y-6 p-5 sm:p-7">{children}</div>
      </section>
    </div>
  )
}

export function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string
  value: ReactNode
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </dt>
      <dd
        className={`mt-1.5 break-words text-sm text-slate-300 ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value ?? 'Not assigned'}
      </dd>
    </div>
  )
}

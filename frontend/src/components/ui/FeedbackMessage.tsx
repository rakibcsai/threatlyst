import { CircleAlert, CircleCheck, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

const tones: Record<
  'success' | 'error',
  { icon: LucideIcon; style: string; live: 'polite' | 'assertive' }
> = {
  success: {
    icon: CircleCheck,
    style: 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300',
    live: 'polite',
  },
  error: {
    icon: CircleAlert,
    style: 'border-rose-400/25 bg-rose-400/10 text-rose-300',
    live: 'assertive',
  },
}

export function FeedbackMessage({
  tone,
  children,
  className = '',
}: {
  tone: 'success' | 'error'
  children: ReactNode
  className?: string
}) {
  const { icon: Icon, style, live } = tones[tone]
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${style} ${className}`}
      role={tone === 'success' ? 'status' : 'alert'}
      aria-live={live}
      aria-atomic="true"
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

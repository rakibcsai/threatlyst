import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
        variant === 'secondary' && 'border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800',
        variant === 'ghost' && 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
        className,
      )}
      {...props}
    />
  )
}

import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, BrainCircuit, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../lib/api-error'

export function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) return <Navigate to="/workspace" replace />

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null)
    try {
      await login({ identifier: identifier.trim(), password })
      const target = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/workspace'
      navigate(target, { replace: true })
    } catch (requestError) { setError(getApiErrorMessage(requestError)) }
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#061019] text-slate-100 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <section className="relative hidden flex-col justify-between border-r border-slate-800/80 p-12 lg:flex xl:p-16">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300"><ShieldCheck className="size-6" /></span><span className="text-lg font-bold tracking-wide">ThreatLyst</span></div>
        <div className="max-w-xl"><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300"><Activity className="size-3.5" />Security intelligence platform</div><h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-white xl:text-6xl">Investigate threats.<br /><span className="text-gradient">Defend with clarity.</span></h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-400">A focused command surface for AI-assisted security operations, threat analysis, and incident response.</p><div className="mt-10 grid grid-cols-2 gap-3"><div className="surface-card p-4"><BrainCircuit className="mb-3 size-5 text-cyan-400" /><p className="text-sm font-semibold">AI-assisted analysis</p><p className="mt-1 text-xs leading-5 text-slate-500">Clear risk context for analyst decisions.</p></div><div className="surface-card p-4"><LockKeyhole className="mb-3 size-5 text-emerald-400" /><p className="text-sm font-semibold">Role-aware access</p><p className="mt-1 text-xs leading-5 text-slate-500">Admin, analyst, and viewer boundaries.</p></div></div></div>
        <p className="text-xs text-slate-600">Authorized personnel only · Activity may be audited</p>
      </section>
      <section className="relative flex items-center justify-center p-6 sm:p-10"><div className="w-full max-w-[420px]"><div className="mb-10 lg:hidden"><div className="flex items-center gap-3"><ShieldCheck className="size-8 text-cyan-400" /><span className="text-xl font-bold">ThreatLyst</span></div></div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Secure access</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Sign in to your workspace</h2><p className="mt-3 text-sm text-slate-500">Use your ThreatLyst username or email.</p><form className="mt-8 space-y-5" onSubmit={submit}><label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Username or email</span><input className="field" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} minLength={3} required autoFocus placeholder="analyst@organization.com" /></label><label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Password</span><span className="relative block"><input className="field pr-11" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-500 hover:text-slate-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>{error && <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300" role="alert">{error}</div>}<Button className="w-full" type="submit" disabled={isLoading}>{isLoading ? <Spinner label="Authenticating" /> : <>Enter ThreatLyst <ArrowRight className="size-4" /></>}</Button></form><div className="mt-8 flex items-start gap-3 border-t border-slate-800 pt-6 text-xs leading-5 text-slate-600"><LockKeyhole className="mt-0.5 size-4 shrink-0" /><p>Your access token is held in memory only and is cleared when this page is closed or refreshed.</p></div></div></section>
    </main>
  )
}

import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ForbiddenPage() { return <main className="grid min-h-[calc(100vh-4rem)] place-items-center p-6 text-center"><div><ShieldX className="mx-auto size-10 text-amber-400" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">403 · Access denied</p><h1 className="mt-3 text-2xl font-semibold text-white">Your role cannot access this area</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Your session is still active. Contact a ThreatLyst administrator if your responsibilities require additional access.</p><Link to="/workspace" className="mt-6 inline-flex text-sm font-semibold text-cyan-400 hover:text-cyan-300">Return to workspace</Link></div></main> }

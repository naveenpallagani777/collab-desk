import type { PropsWithChildren } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from '@components/ui/ThemeToggle'

interface AuthShellProps extends PropsWithChildren {
    title: string
    subtitle: string
    mode: 'login' | 'register'
}

const FEATURES = [
    'Real-time team collaboration',
    'Secure workspace management',
    'Action-first task workflows',
    'Invite members instantly',
]

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const AuthShell = ({ children, title, subtitle, mode }: AuthShellProps) => {
    const isLogin = mode === 'login'
    const location = useLocation()
    const preservedSearch = location.search || ''

    return (
        <div className="min-h-screen lg:grid lg:grid-cols-[1.2fr_1fr]">
            {/* ── Left hero panel (desktop only, always dark) ── */}
            <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-16">
                {/* Background gradients */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />
                    <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-600/10 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/5 blur-2xl" />
                </div>

                {/* Decorative grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="relative z-10 flex flex-col gap-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
                            <span className="font-display text-sm font-bold text-white">C</span>
                        </div>
                        <span className="font-display text-lg font-semibold text-white">CollabDesk</span>
                    </div>

                    {/* Hero copy */}
                    <div>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                            Team productivity platform
                        </p>
                        <h1 className="font-display mb-5 text-4xl font-bold leading-[1.15] text-white xl:text-5xl">
                            Ship faster with<br />a focused team.
                        </h1>
                        <p className="max-w-sm text-[15px] leading-relaxed text-slate-400">
                            Unified workspaces, real-time decisions, and seamless handoffs — all in one place.
                        </p>
                    </div>

                    {/* Feature list */}
                    <ul className="space-y-3.5">
                        {FEATURES.map((feat) => (
                            <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30">
                                    <CheckIcon />
                                </span>
                                {feat}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bottom badge */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 backdrop-blur-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                        <span className="text-xs text-slate-400">Trusted by growing teams worldwide</span>
                    </div>
                </div>
            </section>

            {/* ── Right card panel (theme-responsive) ── */}
            <section className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-14 dark:bg-slate-900 lg:min-h-0 lg:py-16">
                <div className="mb-6 flex w-full max-w-md justify-end">
                    <ThemeToggle />
                </div>

                {/* Mobile logo */}
                <div className="mb-10 flex items-center gap-2.5 lg:hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                        <span className="font-display text-sm font-bold text-white">C</span>
                    </div>
                    <span className="font-display text-lg font-semibold text-slate-900 dark:text-white">CollabDesk</span>
                </div>

                <article className="w-full max-w-md">
                    {/* Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white px-8 py-9 shadow-xl shadow-slate-200/60 dark:border-slate-700/60 dark:bg-slate-800 dark:shadow-black/30">
                        <header className="mb-7">
                            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                                {title}
                            </h2>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                {subtitle}
                            </p>
                        </header>

                        {children}
                    </div>

                    {/* Footer */}
                    <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
                        {isLogin ? (
                            <>
                                New here?{' '}
                                <Link
                                    to={`/register${preservedSearch}`}
                                    className="font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Create an account
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <Link
                                    to={`/login${preservedSearch}`}
                                    className="font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Sign in
                                </Link>
                            </>
                        )}
                    </p>
                </article>
            </section>
        </div>
    )
}

export default AuthShell

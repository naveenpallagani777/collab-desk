import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthShell from '@components/auth/AuthShell'
import { useAuth } from '@context/AuthContext'
import { decodeInviteToken } from '@/utils/inviteToken'

const inputCls = [
    'block w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none',
    'border-slate-200 placeholder:text-slate-400',
    'transition-all duration-200',
    'focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15',
    'dark:border-slate-600 dark:bg-slate-700/60 dark:text-white dark:placeholder:text-slate-500',
    'dark:focus:border-blue-400 dark:focus:bg-slate-700 dark:focus:ring-blue-400/15',
].join(' ')

const Field = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
            {label}
        </label>
        {children}
    </div>
)

const LoginPage = () => {
    const [searchParams] = useSearchParams()
    const invitedEmail = useMemo(() => {
        const inviteToken = searchParams.get('inviteToken')
        const decoded = decodeInviteToken(inviteToken)
        return decoded?.email || searchParams.get('email') || ''
    }, [searchParams])
    const isInviteLocked = Boolean(invitedEmail)
    const redirectPath = searchParams.get('redirect') || '/dashboard'
    const [email, setEmail] = useState(invitedEmail)
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const { login, loading, error, clearError } = useAuth()

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        clearError()
        try {
            await login({ email, password })
            navigate(redirectPath)
        } catch {
            // Error state set in auth context
        }
    }

    return (
        <AuthShell mode="login" title="Welcome back" subtitle="Sign in to continue to your workspace">
            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                <Field id="email" label="Email address">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        className={inputCls}
                        value={email}
                        onChange={(e) => {
                            if (isInviteLocked) return
                            setEmail(e.target.value)
                        }}
                        required
                        autoComplete="email"
                        readOnly={isInviteLocked}
                    />
                </Field>

                <Field id="password" label="Password">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Min. 6 characters"
                        className={inputCls}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                        autoComplete="current-password"
                    />
                </Field>

                {error ? (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/60 dark:bg-red-900/20">
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:shadow-blue-500/20 dark:hover:bg-blue-600"
                >
                    {loading ? (
                        <>
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Signing in...
                        </>
                    ) : 'Sign in'}
                </button>
            </form>
        </AuthShell>
    )
}

export default LoginPage

import { useTheme } from '@context/ThemeContext'

interface ThemeToggleProps {
    className?: string
    fullWidth?: boolean
}

const SunIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
        <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
        <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
    </svg>
)

const MoonIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
)

const SystemIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
)

const OPTIONS = [
    { value: 'light' as const, label: 'Light', Icon: SunIcon },
    { value: 'dark' as const, label: 'Dark', Icon: MoonIcon },
    { value: 'system' as const, label: 'System', Icon: SystemIcon },
]

const ThemeToggle = ({ className = '', fullWidth = false }: ThemeToggleProps) => {
    const { theme, setTheme } = useTheme()

    return (
        <div
            role="group"
            aria-label="Choose color theme"
            className={[
                fullWidth
                    ? 'grid w-full grid-cols-3 items-center gap-0.5 rounded-2xl border border-slate-200/80 bg-white/95 p-1 shadow-xl shadow-slate-200/50 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-black/30'
                    : 'inline-flex w-fit items-center gap-0.5 rounded-full border border-slate-200/80 bg-white/95 p-1 shadow-xl shadow-slate-200/50 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-black/30',
                className,
            ].join(' ')}
        >
            {OPTIONS.map(({ value, label, Icon }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    aria-pressed={theme === value}
                    title={`${label} mode`}
                    className={[
                        fullWidth
                            ? 'flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-medium transition-all duration-200'
                            : 'flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
                        theme === value
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                    ].join(' ')}
                >
                    <Icon />
                    <span className={fullWidth ? 'leading-none whitespace-nowrap' : 'hidden sm:inline'}>{label}</span>
                </button>
            ))}
        </div>
    )
}

export default ThemeToggle

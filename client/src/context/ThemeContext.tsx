import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'collab-desk-theme'

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
    if (theme !== 'system') return theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
    const resolved = getResolvedTheme(theme)
    if (resolved === 'dark') {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
    })

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next)
        localStorage.setItem(STORAGE_KEY, next)
        applyTheme(next)
    }, [])

    useEffect(() => {
        applyTheme(theme)
        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)')
            const handler = () => applyTheme('system')
            mq.addEventListener('change', handler)
            return () => mq.removeEventListener('change', handler)
        }
    }, [theme])

    const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
}

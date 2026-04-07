import {
    createContext,
    useCallback,
    useEffect,
    useContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react'
import authService from '@services/auth.service'
import type { AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'

interface AuthContextValue {
    user: AuthUser | null
    loading: boolean
    initializing: boolean
    backendUnavailable: boolean
    error: string | null
    login: (payload: LoginPayload) => Promise<void>
    register: (payload: RegisterPayload) => Promise<void>
    logout: () => Promise<void>
    retrySession: () => Promise<void>
    clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)
    const [backendUnavailable, setBackendUnavailable] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const clearError = useCallback(() => setError(null), [])

    const login = useCallback(async (payload: LoginPayload) => {
        setLoading(true)
        setError(null)
        try {
            const response = await authService.login(payload)
            setUser(response.data)
            setBackendUnavailable(false)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const register = useCallback(async (payload: RegisterPayload) => {
        setLoading(true)
        setError(null)
        try {
            const response = await authService.register(payload)
            setUser(response.data)
            setBackendUnavailable(false)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            await authService.logout()
            setUser(null)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Logout failed'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const restoreSession = useCallback(async () => {
        try {
            const response = await authService.me()
            setUser(response.data)
            setBackendUnavailable(false)
        } catch (err) {
            const isNetworkIssue =
                typeof err === 'object' &&
                err !== null &&
                ('code' in err || 'message' in err) &&
                (String((err as { code?: string }).code || '').toUpperCase() === 'ERR_NETWORK' ||
                    String((err as { message?: string }).message || '').toLowerCase().includes('network') ||
                    String((err as { message?: string }).message || '').toLowerCase().includes('failed to fetch'))

            setBackendUnavailable(isNetworkIssue)
            if (!isNetworkIssue) {
                setUser(null)
            }
        }
    }, [])

    const retrySession = useCallback(async () => {
        setInitializing(true)
        await restoreSession()
        setInitializing(false)
    }, [restoreSession])

    useEffect(() => {
        let isActive = true

        const run = async () => {
            await restoreSession()
            if (isActive) {
                setInitializing(false)
            }
        }

        run()

        return () => {
            isActive = false
        }
    }, [])

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            initializing,
            backendUnavailable,
            error,
            login,
            register,
            logout,
            retrySession,
            clearError,
        }),
        [user, loading, initializing, backendUnavailable, error, login, register, logout, retrySession, clearError]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

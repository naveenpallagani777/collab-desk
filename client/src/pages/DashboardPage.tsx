import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import ThemeToggle from '@components/ui/ThemeToggle'
import workspaceService from '@services/workspace.service'
import type { WorkspaceMemberItem } from '@/types/workspace'
import { formatEnumLabel } from '@/utils/helpers'

interface ReverseGeocodeResponse {
    display_name?: string
    address?: {
        road?: string
        suburb?: string
        city?: string
        town?: string
        village?: string
        state?: string
        county?: string
        country?: string
        postcode?: string
    }
}

function getInitials(name?: string) {
    if (!name) return '?'
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

const DashboardPage = () => {
    const navigate = useNavigate()
    const { user, logout, loading } = useAuth()
    const [workspaces, setWorkspaces] = useState<WorkspaceMemberItem[]>([])
    const [workspaceLoading, setWorkspaceLoading] = useState(true)
    const [workspaceError, setWorkspaceError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [workspaceName, setWorkspaceName] = useState('')
    const [workspaceDescription, setWorkspaceDescription] = useState('')
    const [workspaceLogoUrl, setWorkspaceLogoUrl] = useState('')
    const [workspaceBannerUrl, setWorkspaceBannerUrl] = useState('')
    const [addressLine1, setAddressLine1] = useState('')
    const [addressLine2, setAddressLine2] = useState('')
    const [city, setCity] = useState('')
    const [stateRegion, setStateRegion] = useState('')
    const [country, setCountry] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [timezone, setTimezone] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [creatingWorkspace, setCreatingWorkspace] = useState(false)
    const [selectingId, setSelectingId] = useState<string | null>(null)

    const resetWorkspaceForm = () => {
        setWorkspaceName('')
        setWorkspaceDescription('')
        setWorkspaceLogoUrl('')
        setWorkspaceBannerUrl('')
        setAddressLine1('')
        setAddressLine2('')
        setCity('')
        setStateRegion('')
        setCountry('')
        setPostalCode('')
        setTimezone('')
        setLatitude('')
        setLongitude('')
    }

    const onLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch {
            // Error tracked in auth context
        }
    }

    const loadWorkspaces = async () => {
        setWorkspaceLoading(true)
        setWorkspaceError(null)
        try {
            const response = await workspaceService.list()
            setWorkspaces(response.data.workspaces || [])
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load workspaces'
            setWorkspaceError(message)
        } finally {
            setWorkspaceLoading(false)
        }
    }

    useEffect(() => {
        loadWorkspaces()
    }, [])

    const workspaceCountLabel = useMemo(() => {
        const count = workspaces.length
        return `${count} workspace${count === 1 ? '' : 's'}`
    }, [workspaces])

    const onCreateWorkspace = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!user?._id || !workspaceName.trim()) return

        const toOptional = (value: string) => {
            const trimmed = value.trim()
            return trimmed.length > 0 ? trimmed : undefined
        }

        const lat = toOptional(latitude)
        const lng = toOptional(longitude)

        const coordinates = lat || lng
            ? {
                lat: lat ? Number(lat) : undefined,
                lng: lng ? Number(lng) : undefined,
            }
            : undefined

        const hasLocation =
            toOptional(addressLine1) ||
            toOptional(addressLine2) ||
            toOptional(city) ||
            toOptional(stateRegion) ||
            toOptional(country) ||
            toOptional(postalCode) ||
            toOptional(timezone) ||
            coordinates

        setCreatingWorkspace(true)
        setWorkspaceError(null)
        try {
            await workspaceService.create({
                name: workspaceName.trim(),
                description: toOptional(workspaceDescription),
                ownerId: user._id,
                logoUrl: toOptional(workspaceLogoUrl),
                bannerUrl: toOptional(workspaceBannerUrl),
                location: hasLocation
                    ? {
                        addressLine1: toOptional(addressLine1),
                        addressLine2: toOptional(addressLine2),
                        city: toOptional(city),
                        state: toOptional(stateRegion),
                        country: toOptional(country),
                        postalCode: toOptional(postalCode),
                        timezone: toOptional(timezone),
                        coordinates:
                            coordinates &&
                            (Number.isFinite(coordinates.lat) || Number.isFinite(coordinates.lng))
                                ? {
                                    lat: Number.isFinite(coordinates.lat) ? coordinates.lat : undefined,
                                    lng: Number.isFinite(coordinates.lng) ? coordinates.lng : undefined,
                                }
                                : undefined,
                    }
                    : undefined,
            })
            resetWorkspaceForm()
            setShowCreateModal(false)
            await loadWorkspaces()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create workspace'
            setWorkspaceError(message)
        } finally {
            setCreatingWorkspace(false)
        }
    }

    const onUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            return
        }

        setGettingLocation(true)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude

                setLatitude(lat.toFixed(6))
                setLongitude(lng.toFixed(6))
                setTimezone((prev) => prev || Intl.DateTimeFormat().resolvedOptions().timeZone || '')

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`
                    )

                    if (!response.ok) {
                        throw new Error('Reverse geocoding failed')
                    }

                    const data = (await response.json()) as ReverseGeocodeResponse
                    const addr = data.address

                    if (addr) {
                        const line1 = [addr.road, addr.suburb].filter(Boolean).join(', ')

                        setAddressLine1((prev) => prev || line1)
                        setCity((prev) => prev || addr.city || addr.town || addr.village || '')
                        setStateRegion((prev) => prev || addr.state || addr.county || '')
                        setCountry((prev) => prev || addr.country || '')
                        setPostalCode((prev) => prev || addr.postcode || '')
                    }
                } catch {
                } finally {
                    setGettingLocation(false)
                }
            },
            (error) => {
                const message =
                    error.code === error.PERMISSION_DENIED
                        ? 'Location permission denied.'
                        : 'Unable to get current location.'
                setWorkspaceError(message)
                setGettingLocation(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        )
    }

    const onSelectWorkspace = async (workspaceId: string) => {
        setSelectingId(workspaceId)
        setWorkspaceError(null)
        try {
            await workspaceService.select(workspaceId)
            navigate(`/workspace/${workspaceId}`)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to select workspace'
            setWorkspaceError(message)
        } finally {
            setSelectingId(null)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Top nav bar */}
            <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                            <span className="font-display text-xs font-bold text-white">C</span>
                        </div>
                        <span className="font-display font-semibold text-slate-900 dark:text-white">CollabDesk</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle className="shrink-0" />
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            {getInitials(user?.username)}
                        </div>
                        <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 sm:block">
                            {user?.username}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="w-full px-4 py-10 sm:px-6 xl:px-8">
                {/* Welcome banner */}
                <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-7 dark:border-blue-900/40 dark:from-blue-950/40 dark:to-indigo-950/40">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/25">
                            {getInitials(user?.username)}
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400">
                                Signed in
                            </p>
                            <h1 className="font-display mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                                Welcome back, {user?.username}!
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Workspace area */}
                <div className="mb-8">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                                    Workspaces
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {workspaceCountLabel} linked to your account
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(true)
                                    }}
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                    type="button"
                                >
                                    Create Workspace
                                </button>
                                <button
                                    onClick={loadWorkspaces}
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                    type="button"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {workspaceError ? (
                            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-400">
                                {workspaceError}
                            </p>
                        ) : null}

                        {workspaceLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700"
                                    />
                                ))}
                            </div>
                        ) : workspaces.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                                No workspaces yet. Create your first workspace from the panel.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {workspaces.map((ws) => {
                                    const isSelecting = selectingId === ws.workspaceId
                                    const workspaceName = ws.workspace?.name || `Workspace ${ws.workspaceId.slice(-6)}`
                                    const workspaceDescription = ws.workspace?.description || 'No description yet.'
                                    const workspaceRoleLabel = formatEnumLabel(ws.standardRole) || 'Member'
                                    return (
                                        <li
                                            key={ws._id}
                                            className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-white dark:border-slate-600 dark:bg-slate-700/40 dark:hover:border-slate-500 dark:hover:bg-slate-700"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate font-semibold text-slate-900 dark:text-white">
                                                            {workspaceName}
                                                        </p>
                                                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {workspaceRoleLabel}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                                                        {workspaceDescription}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => onSelectWorkspace(ws.workspaceId)}
                                                    disabled={isSelecting}
                                                    className={[
                                                        'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                                                        'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60',
                                                    ].join(' ')}
                                                >
                                                    {isSelecting ? 'Opening...' : 'Open workspace'}
                                                </button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </section>
                </div>

                {/* Account card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-5 font-display text-lg font-semibold text-slate-900 dark:text-white">
                        Account
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Username</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{user?.username}</span>
                        </div>
                        <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        disabled={loading}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-red-800 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                        {loading ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Signing out...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign out
                            </>
                        )}
                    </button>
                </div>
            </main>

            {showCreateModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                                    Create Workspace
                                </h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Fill details and optionally use your current location.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateModal(false)
                                }}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <form className="space-y-3" onSubmit={onCreateWorkspace}>
                            <input
                                type="text"
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                placeholder="Workspace name"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                required
                            />
                            <textarea
                                value={workspaceDescription}
                                onChange={(e) => setWorkspaceDescription(e.target.value)}
                                placeholder="Short description (optional)"
                                rows={3}
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                            <input
                                type="url"
                                value={workspaceLogoUrl}
                                onChange={(e) => setWorkspaceLogoUrl(e.target.value)}
                                placeholder="Logo URL (optional)"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                            <input
                                type="url"
                                value={workspaceBannerUrl}
                                onChange={(e) => setWorkspaceBannerUrl(e.target.value)}
                                placeholder="Banner URL (optional)"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />

                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-600 dark:bg-slate-700/40">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                        Location (optional)
                                    </p>
                                    <button
                                        type="button"
                                        onClick={onUseCurrentLocation}
                                        disabled={gettingLocation}
                                        className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {gettingLocation ? 'Locating...' : 'Use current location'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        value={addressLine1}
                                        onChange={(e) => setAddressLine1(e.target.value)}
                                        placeholder="Address line 1"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={addressLine2}
                                        onChange={(e) => setAddressLine2(e.target.value)}
                                        placeholder="Address line 2"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="City"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={stateRegion}
                                        onChange={(e) => setStateRegion(e.target.value)}
                                        placeholder="State / Region"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        placeholder="Country"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        placeholder="Postal code"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        placeholder="Timezone (e.g. Asia/Kolkata)"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:col-span-2"
                                    />
                                    <input
                                        type="number"
                                        step="any"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        placeholder="Latitude"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                    <input
                                        type="number"
                                        step="any"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        placeholder="Longitude"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false)
                                    }}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingWorkspace || !workspaceName.trim()}
                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {creatingWorkspace ? 'Creating...' : 'Create workspace'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}

        </div>
    )
}

export default DashboardPage

import { useEffect, useMemo, useState, type FormEvent, type SVGProps } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ThemeToggle from '@components/ui/ThemeToggle'
import invitationService from '@services/invitation.service'
import workspaceService from '@services/workspace.service'
import type { InvitationItem } from '@/types/invitation'
import type { WorkspaceMemberItem, WorkspaceTeamMember } from '@/types/workspace'
import { formatEnumLabel } from '@/utils/helpers'
import { showToast } from '@/utils/toast'

type IconProps = SVGProps<SVGSVGElement>

const OverviewIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="3" y="4" width="7" height="7" rx="1.5" />
    <rect x="14" y="4" width="7" height="4" rx="1.5" />
    <rect x="14" y="11" width="7" height="9" rx="1.5" />
    <rect x="3" y="14" width="7" height="6" rx="1.5" />
  </svg>
)

const MembersIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M16 19a4 4 0 0 0-8 0" />
    <circle cx="12" cy="10" r="3" />
    <path d="M19 19a3 3 0 0 0-2.2-2.89" />
    <path d="M7.2 16.11A3 3 0 0 0 5 19" />
  </svg>
)

const SettingsIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6" />
  </svg>
)

const sections = [
  { key: 'overview', label: 'Overview', icon: OverviewIcon },
  { key: 'people', label: 'Team Access', icon: MembersIcon },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
] as const

type SectionKey = (typeof sections)[number]['key']

function getRoleTone(role: string) {
  switch (role) {
    case 'OWNER':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300'
    case 'ADMIN':
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

function getStatusTone(status: string) {
  switch (status) {
    case 'PENDING':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300'
    case 'ACCEPTED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300'
    case 'REJECTED':
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

function formatDateLabel(value?: string) {
  if (!value) return 'Recently'

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return 'Recently'

  return parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const WorkspaceDashboardPage = () => {
  const navigate = useNavigate()
  const { workspaceId = '' } = useParams()
  const [section, setSection] = useState<SectionKey>('overview')
  const [workspaceItem, setWorkspaceItem] = useState<WorkspaceMemberItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [creatingInvite, setCreatingInvite] = useState(false)
  const [invitations, setInvitations] = useState<InvitationItem[]>([])
  const [teamMembers, setTeamMembers] = useState<WorkspaceTeamMember[]>([])
  const [latestInvite, setLatestInvite] = useState<InvitationItem | null>(null)
  const [copiedInviteKey, setCopiedInviteKey] = useState<string | null>(null)

  const loadWorkspaceContext = async () => {
    setLoading(true)
    setError(null)
    try {
      const listResponse = await workspaceService.list()
      const matchedWorkspace = (listResponse.data.workspaces || []).find(
        (item) => item.workspaceId === workspaceId
      )

      if (!matchedWorkspace) {
        throw new Error('Workspace not found for this account')
      }

      await workspaceService.select(workspaceId)
      setWorkspaceItem(matchedWorkspace)

      const [inviteResponse, memberResponse] = await Promise.all([
        invitationService.list(),
        workspaceService.members(workspaceId),
      ])

      setInvitations(
        (inviteResponse.data.invitations || []).filter(
          (invite) => invite.workspaceId === workspaceId
        )
      )
      setTeamMembers(memberResponse.data.members || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load workspace dashboard'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!workspaceId) {
      navigate('/dashboard')
      return
    }

    loadWorkspaceContext()
  }, [workspaceId])

  const workspaceName = workspaceItem?.workspace?.name || 'Workspace'
  const workspaceDescription = workspaceItem?.workspace?.description || 'No description yet.'
  const workspaceRole = workspaceItem?.standardRole || 'MEMBER'
  const workspaceRoleLabel = formatEnumLabel(workspaceRole) || 'Member'
  const memberSinceLabel = useMemo(() => formatDateLabel(workspaceItem?.createdAt), [workspaceItem?.createdAt])
  const lastUpdatedLabel = useMemo(() => formatDateLabel(workspaceItem?.updatedAt), [workspaceItem?.updatedAt])
  const sortedInvitations = useMemo(
    () =>
      [...invitations].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      }),
    [invitations]
  )
  const pendingInvitesCount = useMemo(
    () => invitations.filter((invite) => invite.status === 'PENDING').length,
    [invitations]
  )
  const adminInvitesCount = useMemo(
    () => invitations.filter((invite) => invite.role === 'ADMIN').length,
    [invitations]
  )
  const inviteCountLabel = useMemo(() => {
    const count = invitations.length
    return `${count} invite${count === 1 ? '' : 's'}`
  }, [invitations])

  const onCreateInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!inviteEmail.trim()) return

    setCreatingInvite(true)
    setError(null)
    try {
      const response = await invitationService.create({
        email: inviteEmail.trim(),
        role: inviteRole,
      })
      setLatestInvite(response.data)
      setInviteEmail('')
      setInviteRole('member')
      await loadWorkspaceContext()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create invitation'
      setError(message)
    } finally {
      setCreatingInvite(false)
    }
  }

  const onCopyInviteUrl = async (inviteUrl?: string, key?: string) => {
    if (!inviteUrl || !key) return

    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopiedInviteKey(key)
      showToast({ type: 'success', message: 'Invite URL copied to clipboard.' })
      window.setTimeout(() => {
        setCopiedInviteKey((current) => (current === key ? null : current))
      }, 1800)
    } catch {
      const message = 'Unable to copy invite URL. Please try again.'
      setError(message)
      showToast({ type: 'error', message })
    }
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#f6f8fc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="flex min-h-screen w-full gap-6 px-4 py-6 sm:px-6 xl:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-[296px] shrink-0 rounded-2xl border border-slate-200/80 bg-white/92 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/88 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:flex lg:flex-col">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span aria-hidden="true">←</span>
              Back
            </Link>
            <span className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              CollabDesk
            </span>
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="px-3 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                Navigation
              </p>
            </div>
            <nav className="mt-2 space-y-1.5 overflow-y-auto pr-1">
              {sections.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSection(item.key)}
                  className={[
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all duration-200',
                    section === item.key
                      ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-white dark:ring-slate-700'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
                  ].join(' ')}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 truncate text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-start justify-between gap-4 lg:hidden">
            <div className="min-w-0">
              <p className="font-display text-base font-semibold text-slate-900 dark:text-white">CollabDesk</p>
              <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{workspaceRoleLabel} access</p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white/92 p-10 text-sm text-slate-600 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/88 dark:text-slate-300 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              Loading workspace dashboard...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 lg:hidden">
                {sections.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSection(item.key)}
                    className={[
                      'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition',
                      section === item.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300',
                    ].join(' ')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/92 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/88 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="border-b border-slate-200/80 px-6 py-5 dark:border-slate-800/80">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-500 dark:text-blue-400">
                        Workspace cockpit
                      </p>
                      <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {workspaceName}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {workspaceDescription}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:max-w-[320px] xl:justify-end">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleTone(workspaceRole)}`}>
                        {workspaceRoleLabel}
                      </span>
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {inviteCountLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {section === 'overview' ? (
                <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                  <section className="rounded-2xl border border-slate-200/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/88 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                    <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Overview</h3>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,_#111827_0%,_#0f172a_100%)]">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Role</p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{workspaceRoleLabel}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your current permission level.</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,_#111827_0%,_#0f172a_100%)]">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Invites</p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{invitations.length}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Invite links created so far.</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,_#111827_0%,_#0f172a_100%)] sm:col-span-2 xl:col-span-1">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Last updated</p>
                        <p className="mt-3 truncate text-sm font-semibold text-slate-900 dark:text-white">{lastUpdatedLabel}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Last time your workspace membership changed.</p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/70">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Workspace summary</p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {workspaceDescription}
                      </p>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/88 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                    <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Quick actions</h3>
                    <div className="mt-5 space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowInviteModal(true)}
                        className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-700"
                      >
                        <span className="block text-base">Invite a new member</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Create a shareable invite URL for this workspace.</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSection('settings')}
                        className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-700"
                      >
                        <span className="block text-base">Workspace settings</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Review identity, access, and workspace details.</span>
                      </button>
                    </div>
                  </section>
                </div>
              ) : null}

              {section === 'people' ? (
                <section className="rounded-2xl border border-slate-200/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/88 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Team access</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Manage member access and invitation links in one place.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(true)}
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Invite member
                    </button>
                  </div>

                  <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-4 dark:border-slate-800 dark:bg-[linear-gradient(180deg,_#111827_0%,_#0f172a_100%)]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Pending invites</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{pendingInvitesCount}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Awaiting acceptance</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-4 dark:border-slate-800 dark:bg-[linear-gradient(180deg,_#111827_0%,_#0f172a_100%)]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Team members</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{teamMembers.length}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active workspace members</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-4 dark:border-slate-800 dark:bg-[linear-gradient(180deg,_#111827_0%,_#0f172a_100%)]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Admin invites</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{adminInvitesCount}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Higher access links</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-4 dark:border-slate-800 dark:bg-[linear-gradient(180deg,_#111827_0%,_#0f172a_100%)]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Member since</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{memberSinceLabel}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Access start date</p>
                    </div>
                  </div>

                  <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 dark:border-slate-800 dark:bg-slate-800/80">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Current access</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">You can manage invitations and workspace operations based on this role.</p>
                      </div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleTone(workspaceRole)}`}>
                        {workspaceRoleLabel}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Team members</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{teamMembers.length} active</p>
                  </div>

                  {teamMembers.length === 0 ? (
                    <p className="mb-6 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      No members found in this workspace yet.
                    </p>
                  ) : (
                    <div className="mb-6 space-y-3">
                      {teamMembers.map((member) => {
                        const memberName = [member.user?.firstName, member.user?.lastName].filter(Boolean).join(' ').trim() || member.displayName || member.user?.username || member.workspaceEmail || 'Member'
                        const memberEmail = member.user?.email || member.workspaceEmail || 'No email'
                        const avatarChar = memberName.slice(0, 1).toUpperCase()

                        return (
                          <div key={member._id} className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/80">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                                  {avatarChar}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{memberName}</p>
                                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{memberEmail}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getRoleTone(member.standardRole)}`}>
                                  {formatEnumLabel(member.standardRole)}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Joined {formatDateLabel(member.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Invitation queue</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sortedInvitations.length} total</p>
                  </div>

                  {sortedInvitations.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      No invitations created yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {sortedInvitations.map((invite) => (
                        <div key={invite._id} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/90">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {invite.email.slice(0, 1).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900 dark:text-white">{invite.email}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Created {formatDateLabel(invite.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusTone(invite.status)}`}>
                                {formatEnumLabel(invite.status)}
                              </span>
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getRoleTone(invite.role)}`}>
                                {formatEnumLabel(invite.role)}
                              </span>
                            </div>
                          </div>
                          {invite.inviteUrl ? (
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                onClick={() => onCopyInviteUrl(invite.inviteUrl, invite._id)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                              >
                                {copiedInviteKey === invite._id ? 'Copied' : 'Copy URL'}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null}

              {section === 'settings' ? (
                <section className="rounded-2xl border border-slate-200/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/88 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Settings</h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Appearance</p>
                      <div className="mt-3">
                        <ThemeToggle fullWidth />
                      </div>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Choose Light, Dark, or follow your System preference.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Role</p>
                      <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{workspaceRoleLabel}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your current level of workspace control.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800 sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Description</p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{workspaceDescription}</p>
                    </div>
                  </div>
                </section>
              ) : null}
            </>
          )}
        </main>
      </div>

      {showInviteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.2)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/95 dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Invite Member</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Create an invite URL for {workspaceName}. The invite page keeps email in readable form.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <form className="space-y-3" onSubmit={onCreateInvite}>
              <input
                type="email"
                placeholder="Invitee email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                required
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>

              {latestInvite?.inviteUrl ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900/60 dark:bg-emerald-900/20">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">Invite created</p>
                  <div className="mt-3 flex justify-start">
                    <button
                      type="button"
                      onClick={() => onCopyInviteUrl(latestInvite.inviteUrl, 'latest-invite')}
                      className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800"
                    >
                      {copiedInviteKey === 'latest-invite' ? 'Copied' : 'Copy URL'}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingInvite}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingInvite ? 'Creating...' : 'Create invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default WorkspaceDashboardPage

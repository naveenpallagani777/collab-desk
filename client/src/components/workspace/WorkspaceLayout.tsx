import type { SVGProps } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { WorkspaceProvider, useWorkspace, getRoleTone } from '@context/WorkspaceContext'

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

const navItems = [
  { path: '', label: 'Overview', icon: OverviewIcon, end: true },
  { path: 'team', label: 'Team Access', icon: MembersIcon, end: false },
  { path: 'settings', label: 'Settings', icon: SettingsIcon, end: false },
]

const WorkspaceLayoutInner = () => {
  const { workspaceId = '' } = useParams()
  const {
    loading,
    error,
    workspaceName,
    workspaceDescription,
    workspaceRole,
    workspaceRoleLabel,
    inviteCountLabel,
    showInviteModal,
    setShowInviteModal,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    creatingInvite,
    latestInvite,
    copiedInviteKey,
    onCreateInvite,
    onCopyInviteUrl,
  } = useWorkspace()

  const basePath = `/workspace/${workspaceId}`

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#f6f8fc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="flex min-h-screen w-full gap-6 px-4 py-6 sm:px-6 xl:px-8">
        {/* Desktop sidebar */}
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
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path ? `${basePath}/${item.path}` : basePath}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all duration-200',
                      isActive
                        ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-white dark:ring-slate-700'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
                    ].join(' ')
                  }
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 truncate text-sm font-semibold">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content area */}
        <main className="min-w-0 flex-1">
          {/* Mobile header */}
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
              {/* Mobile tab bar */}
              <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 lg:hidden">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path ? `${basePath}/${item.path}` : basePath}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>

              {/* Workspace header banner */}
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

              {/* Sub-page content rendered here */}
              <Outlet />
            </>
          )}
        </main>
      </div>

      {/* Invite modal (shared between Overview and Team pages) */}
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

const WorkspaceLayout = () => (
  <WorkspaceProvider>
    <WorkspaceLayoutInner />
  </WorkspaceProvider>
)

export default WorkspaceLayout

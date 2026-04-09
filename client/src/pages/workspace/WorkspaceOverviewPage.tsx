import { Link, useParams } from 'react-router-dom'
import { useWorkspace } from '@context/WorkspaceContext'

const WorkspaceOverviewPage = () => {
  const { workspaceId = '' } = useParams()
  const {
    workspaceRoleLabel,
    workspaceDescription,
    invitations,
    lastUpdatedLabel,
    setShowInviteModal,
  } = useWorkspace()

  return (
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
          <Link
            to={`/workspace/${workspaceId}/settings`}
            className="block w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-700"
          >
            <span className="block text-base">Workspace settings</span>
            <span className="mt-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Review identity, access, and workspace details.</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default WorkspaceOverviewPage

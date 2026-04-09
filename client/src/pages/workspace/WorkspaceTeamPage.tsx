import { useWorkspace, getRoleTone, getStatusTone, formatDateLabel } from '@context/WorkspaceContext'
import { formatEnumLabel } from '@/utils/helpers'

/** Deterministic avatar colour from a string (name/email). */
function avatarColor(seed: string) {
  const palette = [
    'bg-blue-600 text-white',
    'bg-violet-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-500 text-white',
    'bg-rose-600 text-white',
    'bg-cyan-600 text-white',
    'bg-indigo-600 text-white',
    'bg-pink-600 text-white',
    'bg-teal-600 text-white',
    'bg-orange-600 text-white',
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const WorkspaceTeamPage = () => {
  const {
    teamMembers,
    sortedInvitations,
    pendingInvitesCount,
    adminInvitesCount,
    copiedInviteKey,
    setShowInviteModal,
    onCopyInviteUrl,
  } = useWorkspace()

  return (
    <div className="space-y-6">
      {/* Page header + invite button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Team access</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage members and invitation links for this workspace.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Invite member
        </button>
      </div>

      {/* Compact stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/92 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/88">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Members</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{teamMembers.length}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active in workspace</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/92 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/88">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Pending invites</p>
          <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingInvitesCount}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Awaiting acceptance</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/92 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/88">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Admin invites</p>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{adminInvitesCount}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Higher-access links</p>
        </div>
      </div>

      {/* Team members */}
      <section className="rounded-2xl border border-slate-200/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/88 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Team members</p>
          <p className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {teamMembers.length} active
          </p>
        </div>

        {teamMembers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No members found in this workspace yet. Invite someone to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member) => {
              const fullName = [member.user?.firstName, member.user?.lastName].filter(Boolean).join(' ').trim()
              const username = member.user?.username
              const memberEmail = member.user?.email || member.workspaceEmail || 'No email'
              // Display name: prefer real name, then displayName, fallback to extracting from email
              const displayName = fullName
                || member.displayName
                || (memberEmail !== 'No email' ? memberEmail.split('@')[0] : 'Member')
              const initials = getInitials(displayName)
              const colorClass = avatarColor(memberEmail)

              return (
                <div key={member._id} className="rounded-2xl border border-slate-200/80 bg-slate-50 px-5 py-4 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colorClass}`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{memberEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getRoleTone(member.standardRole)}`}>
                        {formatEnumLabel(member.standardRole)}
                      </span>
                      <span className="hidden text-[11px] text-slate-400 dark:text-slate-500 sm:inline">
                        Joined {formatDateLabel(member.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Invitation queue */}
      <section className="rounded-2xl border border-slate-200/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/88 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Invitation queue</p>
          <p className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {sortedInvitations.length} total
          </p>
        </div>

        {sortedInvitations.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No invitations created yet. Click "Invite member" above to send one.
          </p>
        ) : (
          <div className="space-y-3">
            {sortedInvitations.map((invite) => {
              const initial = invite.email.slice(0, 1).toUpperCase()
              const colorClass = avatarColor(invite.email)

              return (
                <div key={invite._id} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/90">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colorClass}`}>
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{invite.email}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Sent {formatDateLabel(invite.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusTone(invite.status)}`}>
                        {formatEnumLabel(invite.status)}
                      </span>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getRoleTone(invite.role)}`}>
                        {formatEnumLabel(invite.role)}
                      </span>
                      {invite.inviteUrl ? (
                        <button
                          type="button"
                          onClick={() => onCopyInviteUrl(invite.inviteUrl, invite._id)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {copiedInviteKey === invite._id ? '✓ Copied' : 'Copy URL'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default WorkspaceTeamPage

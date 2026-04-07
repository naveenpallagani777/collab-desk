import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import ThemeToggle from '@components/ui/ThemeToggle'
import { formatEnumLabel } from '@/utils/helpers'
import { decodeInviteToken } from '@/utils/inviteToken'
import invitationService from '@services/invitation.service'

const InvitePage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [acceptingInvite, setAcceptingInvite] = useState(false)
  const [acceptError, setAcceptError] = useState('')

  const inviteToken = searchParams.get('inviteToken') || ''
  const decodedInvite = decodeInviteToken(inviteToken)

  const invitationId = decodedInvite?.invitationId || searchParams.get('invitationId') || ''
  const workspaceId = decodedInvite?.workspaceId || searchParams.get('workspaceId') || ''
  const email = decodedInvite?.email || searchParams.get('email') || ''
  const role = decodedInvite?.role || searchParams.get('role') || 'MEMBER'
  const roleLabel = formatEnumLabel(role) || 'Member'
  const invitePath = inviteToken ? `/invite?inviteToken=${encodeURIComponent(inviteToken)}` : `/invite?${searchParams.toString()}`
  const loginPath = `/login?redirect=${encodeURIComponent(invitePath)}${inviteToken ? `&inviteToken=${encodeURIComponent(inviteToken)}` : email ? `&email=${encodeURIComponent(email)}` : ''}`
  const registerPath = `/register?redirect=${encodeURIComponent(invitePath)}${inviteToken ? `&inviteToken=${encodeURIComponent(inviteToken)}` : email ? `&email=${encodeURIComponent(email)}` : ''}`

  const onAcceptInvite = async () => {
    setAcceptingInvite(true)
    setAcceptError('')

    try {
      const response = await invitationService.accept({
        inviteToken: inviteToken || undefined,
        invitationId: invitationId || undefined,
        workspaceId: workspaceId || undefined,
        email: email || undefined,
        role: role || undefined,
      })

      const targetWorkspaceId = response.data.workspaceId || workspaceId
      if (!targetWorkspaceId) {
        throw new Error('Workspace not found in invitation response')
      }

      navigate(`/workspace/${targetWorkspaceId}`)
    } catch (err) {
      setAcceptError(err instanceof Error ? err.message : 'Failed to accept invitation')
    } finally {
      setAcceptingInvite(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500 dark:text-blue-400">
          Workspace invitation
        </p>
        <h1 className="font-display mt-3 text-3xl font-bold text-slate-900 dark:text-white">
          You have been invited to join a workspace
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          This invite uses an encoded token. The invited email is prefilled and locked on sign in or sign up.
        </p>

        <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">Invited email</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{email || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">Role</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{roleLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">Workspace ID</span>
            <span className="max-w-[60%] truncate text-sm font-semibold text-slate-900 dark:text-white">{workspaceId || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">Invitation ID</span>
            <span className="max-w-[60%] truncate text-sm font-semibold text-slate-900 dark:text-white">{invitationId || 'Not provided'}</span>
          </div>
        </div>

        {user ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-900/20">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Signed in as {user.email}
            </p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
              Invite details are loaded. Continue to accept this invite and open the workspace.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onAcceptInvite}
                disabled={acceptingInvite}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {acceptingInvite ? 'Opening workspace...' : 'Go to workspace'}
              </button>
            </div>
            {acceptError ? (
              <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">{acceptError}</p>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to={loginPath}
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Continue to sign in
            </Link>
            <Link
              to={registerPath}
              className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Create account instead
            </Link>
          </div>
        )}
        </div>
      </div>
    </main>
  )
}

export default InvitePage

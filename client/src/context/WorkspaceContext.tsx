import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type PropsWithChildren,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import invitationService from '@services/invitation.service'
import workspaceService from '@services/workspace.service'
import type { InvitationItem } from '@/types/invitation'
import type { WorkspaceMemberItem, WorkspaceTeamMember } from '@/types/workspace'
import { formatEnumLabel } from '@/utils/helpers'
import { showToast } from '@/utils/toast'

/* ------------------------------------------------------------------ */
/*  Pure helper functions – exported for use in sub-pages              */
/* ------------------------------------------------------------------ */

export function getRoleTone(role: string) {
  switch (role) {
    case 'OWNER':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300'
    case 'ADMIN':
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

export function getStatusTone(status: string) {
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

export function formatDateLabel(value?: string) {
  if (!value) return 'Recently'

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return 'Recently'

  return parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/* ------------------------------------------------------------------ */
/*  Context definition                                                */
/* ------------------------------------------------------------------ */

interface WorkspaceContextValue {
  workspaceItem: WorkspaceMemberItem | null
  loading: boolean
  error: string | null
  invitations: InvitationItem[]
  teamMembers: WorkspaceTeamMember[]
  sortedInvitations: InvitationItem[]
  workspaceName: string
  workspaceDescription: string
  workspaceRole: string
  workspaceRoleLabel: string
  memberSinceLabel: string
  lastUpdatedLabel: string
  pendingInvitesCount: number
  adminInvitesCount: number
  inviteCountLabel: string
  showInviteModal: boolean
  setShowInviteModal: (show: boolean) => void
  inviteEmail: string
  setInviteEmail: (email: string) => void
  inviteRole: 'admin' | 'member'
  setInviteRole: (role: 'admin' | 'member') => void
  creatingInvite: boolean
  latestInvite: InvitationItem | null
  copiedInviteKey: string | null
  onCreateInvite: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onCopyInviteUrl: (inviteUrl?: string, key?: string) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

export const WorkspaceProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate()
  const { workspaceId = '' } = useParams()
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

  const loadWorkspaceContext = useCallback(async () => {
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
  }, [workspaceId])

  useEffect(() => {
    if (!workspaceId) {
      navigate('/dashboard')
      return
    }

    loadWorkspaceContext()
  }, [workspaceId, loadWorkspaceContext, navigate])

  /* Derived values */
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

  /* Actions */
  const onCreateInvite = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
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
    },
    [inviteEmail, inviteRole, loadWorkspaceContext]
  )

  const onCopyInviteUrl = useCallback(async (inviteUrl?: string, key?: string) => {
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
  }, [])

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceItem,
      loading,
      error,
      invitations,
      teamMembers,
      sortedInvitations,
      workspaceName,
      workspaceDescription,
      workspaceRole,
      workspaceRoleLabel,
      memberSinceLabel,
      lastUpdatedLabel,
      pendingInvitesCount,
      adminInvitesCount,
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
    }),
    [
      workspaceItem, loading, error, invitations, teamMembers, sortedInvitations,
      workspaceName, workspaceDescription, workspaceRole, workspaceRoleLabel,
      memberSinceLabel, lastUpdatedLabel, pendingInvitesCount, adminInvitesCount,
      inviteCountLabel, showInviteModal, inviteEmail, inviteRole, creatingInvite,
      latestInvite, copiedInviteKey, onCreateInvite, onCopyInviteUrl,
    ]
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}

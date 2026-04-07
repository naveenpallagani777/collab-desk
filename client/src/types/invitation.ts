export interface InvitationItem {
  _id: string
  email: string
  workspaceId: string
  invitedBy: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  role: 'ADMIN' | 'MEMBER' | string
  inviteUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface InvitationListData {
  invitations: InvitationItem[]
}

export interface InvitationEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface CreateInvitationPayload {
  email: string
  role: 'admin' | 'member'
}

export interface AcceptInvitationPayload {
  inviteToken?: string
  invitationId?: string
  workspaceId?: string
  email?: string
  role?: string
}

export interface WorkspaceMemberItem {
  _id: string
  workspaceId: string
  userId: string
  standardRole: 'OWNER' | 'ADMIN' | 'MEMBER' | string
  isActive?: boolean
  displayName?: string
  workspaceEmail?: string
  createdAt?: string
  updatedAt?: string
  workspace?: {
    _id: string
    name: string
    description?: string
    logoUrl?: string
    bannerUrl?: string
  }
}

export interface WorkspaceListData {
  workspaces: WorkspaceMemberItem[]
  invitations: unknown[]
}

export interface WorkspaceTeamMember {
  _id: string
  workspaceId: string
  userId: string
  standardRole: 'OWNER' | 'ADMIN' | 'MEMBER' | string
  isActive?: boolean
  displayName?: string
  workspaceEmail?: string
  createdAt?: string
  updatedAt?: string
  user?: {
    _id: string
    username?: string
    firstName?: string
    lastName?: string
    email?: string
  }
}

export interface WorkspaceMembersData {
  members: WorkspaceTeamMember[]
}

export interface WorkspaceEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface CreateWorkspacePayload {
  name: string
  description?: string
  ownerId: string
  logoUrl?: string
  bannerUrl?: string
  location?: {
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    timezone?: string
    coordinates?: {
      lat?: number
      lng?: number
    }
  }
}

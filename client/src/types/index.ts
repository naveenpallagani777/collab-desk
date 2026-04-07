/* Common Types */

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Workspace {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'admin' | 'member' | 'viewer'
  joinedAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

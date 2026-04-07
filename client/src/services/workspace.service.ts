import apiClient from '@services/api'
import { API_ENDPOINTS } from '@constants/api'
import type {
  CreateWorkspacePayload,
  WorkspaceEnvelope,
  WorkspaceListData,
  WorkspaceMembersData,
} from '@/types/workspace'

const readErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const responseData = error.response.data as { message?: string }
    if (responseData.message) {
      return responseData.message
    }
  }

  return error instanceof Error ? error.message : 'Workspace request failed'
}

const workspaceService = {
  async list(): Promise<WorkspaceEnvelope<WorkspaceListData>> {
    try {
      const response = await apiClient.get<WorkspaceEnvelope<WorkspaceListData>>(
        API_ENDPOINTS.WORKSPACES.LIST
      )
      return response.data
    } catch (error) {
      throw new Error(readErrorMessage(error))
    }
  },

  async create(payload: CreateWorkspacePayload): Promise<WorkspaceEnvelope<unknown>> {
    try {
      const response = await apiClient.post<WorkspaceEnvelope<unknown>>(
        API_ENDPOINTS.WORKSPACES.CREATE,
        payload
      )
      return response.data
    } catch (error) {
      throw new Error(readErrorMessage(error))
    }
  },

  async select(workspaceId: string): Promise<WorkspaceEnvelope<unknown>> {
    try {
      const response = await apiClient.post<WorkspaceEnvelope<unknown>>(
        API_ENDPOINTS.WORKSPACES.SELECT(workspaceId)
      )
      return response.data
    } catch (error) {
      throw new Error(readErrorMessage(error))
    }
  },

  async members(workspaceId: string): Promise<WorkspaceEnvelope<WorkspaceMembersData>> {
    try {
      const response = await apiClient.get<WorkspaceEnvelope<WorkspaceMembersData>>(
        API_ENDPOINTS.WORKSPACES.MEMBERS(workspaceId)
      )
      return response.data
    } catch (error) {
      throw new Error(readErrorMessage(error))
    }
  },
}

export default workspaceService

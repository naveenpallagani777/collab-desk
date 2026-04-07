import apiClient from '@services/api'
import { API_ENDPOINTS } from '@constants/api'
import type {
  AcceptInvitationPayload,
  CreateInvitationPayload,
  InvitationEnvelope,
  InvitationItem,
  InvitationListData,
} from '@/types/invitation'

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

  return error instanceof Error ? error.message : 'Invitation request failed'
}

const invitationService = {
  async list(): Promise<InvitationEnvelope<InvitationListData>> {
    try {
      const response = await apiClient.get<InvitationEnvelope<InvitationListData>>(
        API_ENDPOINTS.INVITATIONS.LIST
      )
      return response.data
    } catch (error) {
      throw new Error(readErrorMessage(error))
    }
  },

  async create(payload: CreateInvitationPayload): Promise<InvitationEnvelope<InvitationItem>> {
    try {
      const response = await apiClient.post<InvitationEnvelope<InvitationItem>>(
        API_ENDPOINTS.INVITATIONS.CREATE,
        payload
      )
      return response.data
    } catch (error) {
      throw new Error(readErrorMessage(error))
    }
  },

  async accept(payload: AcceptInvitationPayload): Promise<InvitationEnvelope<{ workspaceId: string }>> {
    try {
      const response = await apiClient.post<InvitationEnvelope<{ workspaceId: string }>>(
        API_ENDPOINTS.INVITATIONS.ACCEPT,
        payload
      )
      return response.data
    } catch (error) {
      throw new Error(readErrorMessage(error))
    }
  },
}

export default invitationService

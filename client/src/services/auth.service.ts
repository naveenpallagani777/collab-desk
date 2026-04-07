import apiClient from '@services/api'
import { API_ENDPOINTS } from '@constants/api'
import type {
    ApiEnvelope,
    AuthUser,
    LoginPayload,
    RegisterPayload,
} from '@/types/auth'

type MeEnvelopeData =
    | AuthUser
    | {
        user: AuthUser
        workspace?: unknown
    }

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

    return error instanceof Error ? error.message : 'Request failed'
}

const authService = {
    async register(payload: RegisterPayload): Promise<ApiEnvelope<AuthUser>> {
        try {
            const response = await apiClient.post<ApiEnvelope<AuthUser>>(API_ENDPOINTS.AUTH.REGISTER, payload)
            return response.data
        } catch (error) {
            throw new Error(readErrorMessage(error))
        }
    },

    async login(payload: LoginPayload): Promise<ApiEnvelope<AuthUser>> {
        try {
            const response = await apiClient.post<ApiEnvelope<AuthUser>>(API_ENDPOINTS.AUTH.LOGIN, payload)
            return response.data
        } catch (error) {
            throw new Error(readErrorMessage(error))
        }
    },

    async logout(): Promise<ApiEnvelope<null>> {
        try {
            const response = await apiClient.post<ApiEnvelope<null>>(API_ENDPOINTS.AUTH.LOGOUT)
            return response.data
        } catch (error) {
            throw new Error(readErrorMessage(error))
        }
    },

    async me(): Promise<ApiEnvelope<AuthUser>> {
        try {
            const response = await apiClient.get<ApiEnvelope<MeEnvelopeData>>('/auth/me')
            const payload = response.data.data

            const user =
                payload && typeof payload === 'object' && 'user' in payload
                    ? payload.user
                    : (payload as AuthUser)

            return {
                ...response.data,
                data: user,
            }
        } catch (error) {
            throw new Error(readErrorMessage(error))
        }
    },
}

export default authService

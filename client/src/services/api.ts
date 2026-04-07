import axios, { AxiosInstance } from 'axios'
import { API_BASE_URL } from '@constants/api'
import { showToast } from '@/utils/toast'

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status as number | undefined
        const backendMessage = error?.response?.data?.message as string | undefined
        const code = String(error?.code || '').toUpperCase()

        let friendlyMessage = backendMessage || ''

        if (code === 'ERR_NETWORK') {
            friendlyMessage = 'Cannot connect to the server. Please check backend and try again.'
        } else if (!friendlyMessage && status === 401) {
            friendlyMessage = 'Please sign in to continue.'
        } else if (!friendlyMessage && status === 403) {
            friendlyMessage = 'You do not have permission to perform this action.'
        } else if (!friendlyMessage && status === 404) {
            friendlyMessage = 'Requested resource was not found.'
        } else if ((status || 0) >= 500) {
            friendlyMessage = 'Something went wrong on the server. Please try again shortly.'
        } else if (!friendlyMessage) {
            friendlyMessage = 'Request failed. Please try again.'
        }

        error.message = friendlyMessage
        if (!error.response?.data?.message) {
            error.response = {
                ...(error.response || {}),
                data: {
                    ...(error.response?.data || {}),
                    message: friendlyMessage,
                },
            }
        }

        showToast({ type: 'error', message: friendlyMessage })
        return Promise.reject(error)
    }
)

export default apiClient

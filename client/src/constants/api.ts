/* API Configuration */

// Default to same-origin proxy in dev (`/api`) so session cookies survive across refreshes.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  WORKSPACES: {
    LIST: '/workspace',
    CREATE: '/workspace',
    GET: (id: string) => `/workspace/${id}`,
    MEMBERS: (id: string) => `/workspace/${id}/members`,
    UPDATE: (id: string) => `/workspace/${id}`,
    DELETE: (id: string) => `/workspace/${id}`,
    SELECT: (id: string) => `/workspace/${id}/select`,
  },
  INVITATIONS: {
    LIST: '/invitation',
    CREATE: '/invitation',
    ACCEPT: '/invitation/accept',
    GET: (id: string) => `/invitation/${id}`,
  },
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
}

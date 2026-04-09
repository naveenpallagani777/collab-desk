export interface AuthUser {
  _id: string
  username: string
  email: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
}

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

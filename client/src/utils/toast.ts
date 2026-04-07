export type ToastType = 'success' | 'error' | 'info'

export interface ToastPayload {
  type?: ToastType
  message: string
}

export interface ToastMessage {
  id: number
  type: ToastType
  message: string
}

type ToastListener = (toast: ToastMessage) => void

const listeners = new Set<ToastListener>()
let counter = 0

export const showToast = (payload: ToastPayload) => {
  const toast: ToastMessage = {
    id: Date.now() + counter,
    type: payload.type || 'info',
    message: payload.message,
  }
  counter += 1

  listeners.forEach((listener) => listener(toast))
}

export const subscribeToasts = (listener: ToastListener) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

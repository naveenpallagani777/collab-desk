import { useEffect, useMemo, useState } from 'react'
import { subscribeToasts, type ToastMessage } from '@/utils/toast'

const toneByType = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300',
  error: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-300',
} as const

const ToastViewport = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToasts((toast) => {
      setToasts((prev) => [...prev, toast])
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id))
      }, 3200)
    })

    return unsubscribe
  }, [])

  const renderedToasts = useMemo(() => toasts.slice(-4), [toasts])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[1200] flex w-[min(92vw,360px)] flex-col gap-2">
      {renderedToasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            'pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur',
            toneByType[toast.type],
          ].join(' ')}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export default ToastViewport

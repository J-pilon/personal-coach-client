import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import Toast, { ToastData, ToastVariant } from './Toast'

interface ToastOptions {
  durationMs?: number
}

interface ToastApi {
  success: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
  dismiss: (id: string) => void
}

const DEFAULT_DURATION_MS = 4000
const MAX_VISIBLE = 3

const ToastContext = createContext<ToastApi | null>(null)

let externalToastApi: ToastApi | null = null

export function getToastApi(): ToastApi | null {
  return externalToastApi
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const show = useCallback(
    (variant: ToastVariant, message: string, options?: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setToasts((prev) => [...prev, { id, message, variant }].slice(-MAX_VISIBLE))
      const duration = options?.durationMs ?? DEFAULT_DURATION_MS
      const timer = setTimeout(() => dismiss(id), duration)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, options) => show('success', message, options),
      error: (message, options) => show('error', message, options),
      info: (message, options) => show('info', message, options),
      dismiss,
    }),
    [show, dismiss],
  )

  useEffect(() => {
    externalToastApi = api
    return () => {
      if (externalToastApi === api) {
        externalToastApi = null
      }
    }
  }, [api])

  useEffect(() => {
    const currentTimers = timers.current
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer))
      currentTimers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View
        pointerEvents="box-none"
        className="absolute top-0 left-0 right-0 pt-2"
        testID="toast-stack"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  )
}

const NOOP_TOAST: ToastApi = {
  success: () => {},
  error: () => {},
  info: () => {},
  dismiss: () => {},
}

export function useToast(): ToastApi {
  return useContext(ToastContext) ?? NOOP_TOAST
}

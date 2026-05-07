import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'
import { IconButton } from './buttons'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastData {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

const VARIANT_STYLES: Record<ToastVariant, { bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }> = {
  success: { bg: 'bg-emerald-500', icon: 'checkmark-circle', iconColor: '#ffffff' },
  error: { bg: 'bg-red-500', icon: 'alert-circle', iconColor: '#ffffff' },
  info: { bg: 'bg-cyan-500', icon: 'information-circle', iconColor: '#ffffff' },
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const { bg, icon, iconColor } = VARIANT_STYLES[toast.variant]

  return (
    <View
      className={`flex-row items-center px-4 py-3 mx-4 mb-2 rounded-xl shadow-md ${bg}`}
      testID={`toast-${toast.variant}`}
    >
      <Ionicons name={icon} size={22} color={iconColor} />
      <Text className="flex-1 ml-3 text-base font-medium text-white" testID="toast-message">
        {toast.message}
      </Text>
      <IconButton
        icon={<Ionicons name="close" size={20} color={iconColor} />}
        onPress={() => onDismiss(toast.id)}
        accessibilityLabel="Dismiss notification"
        testID="toast-dismiss"
        className="p-1 ml-2"
      />
    </View>
  )
}

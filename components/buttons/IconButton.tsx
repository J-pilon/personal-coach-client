import React from 'react'
import { TouchableOpacity } from 'react-native'

interface IconButtonProps {
  icon: React.ReactNode
  onPress: () => void
  disabled?: boolean
  className?: string
  accessibilityLabel?: string
  testID?: string
}

export default function IconButton({
  icon,
  onPress,
  disabled = false,
  className = '',
  accessibilityLabel,
  testID = 'icon-button',
}: IconButtonProps) {
  return (
    <TouchableOpacity
      className={`items-center justify-center ${className}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {icon}
    </TouchableOpacity>
  )
}

import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PrimaryButtonProps {
  title: string
  onPress: () => void
  isLoading?: boolean
  loadingText?: string
  icon?: keyof typeof Ionicons.glyphMap
  iconColor?: string
  disabled?: boolean
  className?: string
}

export default function PrimaryButton({
  title,
  onPress,
  isLoading = false,
  loadingText,
  icon,
  iconColor = "#021A40",
  disabled = false,
  className = ""
}: PrimaryButtonProps) {
  const isDisabled = disabled || isLoading
  const displayText = isLoading && loadingText ? loadingText : title

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center py-4 px-6 rounded-xl shadow-md ${isDisabled ? 'bg-[#808080]' : 'bg-cyan-400'} ${className}`}
      onPress={onPress}
      disabled={isDisabled}
      testID="primary-button"
    >
      <Text className="text-lg font-semibold text-[#021A40]" testID="primary-button-text">
        {displayText}
      </Text>
      {!isLoading && icon && (
        <Ionicons name={icon} size={20} color={iconColor} className="ml-2" />
      )}
    </TouchableOpacity>
  )
}
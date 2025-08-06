import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

interface SecondaryButtonProps {
  title: string
  onPress: () => void
  isLoading?: boolean
  loadingText?: string
  disabled?: boolean
  testID?: string
}

export default function SecondaryButton({
  title,
  onPress,
  isLoading = false,
  loadingText,
  disabled = false,
  testID = "primary-button"
}: SecondaryButtonProps) {
  const isDisabled = disabled || isLoading
  const displayText = isLoading && loadingText ? loadingText : title

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center py-4 px-6 rounded-xl shadow-md ${isDisabled ? 'bg-[#808080]' : 'bg-transparent'}`}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
    >
      <Text className="text-lg font-semibold text-cyan-400" testID="ai-onboarding-skip-button-text">
        {displayText}
      </Text>
    </TouchableOpacity>
  )
}
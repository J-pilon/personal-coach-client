import LinearGradient from '@/components/ui/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Text, TouchableOpacity, View } from 'react-native';
import LoadingSpinner from './LoadingSpinner';

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** The text to display */
  text?: string;
  /** The subtitle text */
  subtitle?: string;
  /** Whether to show a close button */
  showCloseButton?: boolean;
  /** Callback when close button is pressed */
  onClose?: () => void;
  /** Whether to show a progress indicator */
  showProgress?: boolean;
  /** The progress value (0-100) */
  progress?: number;
  /** Whether the overlay is dismissible by tapping outside */
  dismissible?: boolean;
  /** Custom test ID for testing */
  testID?: string;
}

export default function LoadingOverlay({
  visible,
  text = 'Loading...',
  subtitle,
  showCloseButton = false,
  onClose,
  showProgress = false,
  progress = 0,
  dismissible = false,
  testID = 'loading-overlay'
}: LoadingOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const handleBackdropPress = () => {
    if (dismissible && onClose) {
      onClose();
    }
  };

  const renderProgressBar = () => {
    if (!showProgress) return null;

    return (
      <View className="mt-4 w-full">
        <View className="w-full bg-[#2B42B6]/30 rounded-full h-2 overflow-hidden">
          <Animated.View
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
            style={{
              width: `${progress}%`,
            }}
          />
        </View>
        <Text className="text-[#E6FAFF] text-sm text-center mt-2 font-medium">
          {progress}%
        </Text>
      </View>
    );
  };

  const renderCloseButton = () => {
    if (!showCloseButton || !onClose) return null;

    return (
      <TouchableOpacity
        className="absolute top-4 right-4 w-8 h-8 items-center justify-center rounded-full bg-[#2B42B6]/30 border border-[#33CFFF]/20"
        onPress={onClose}
        testID={`${testID}-close-button`}
      >
        <Ionicons name="close" size={20} color="#E6FAFF" />
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      testID={testID}
    >
      <TouchableOpacity
        className="flex-1"
        activeOpacity={1}
        onPress={handleBackdropPress}
        testID={`${testID}-backdrop`}
      >
        <LinearGradient>
          <View className="flex-1 justify-center items-center px-8">
            <Animated.View
              className="items-center"
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }}
              testID={`${testID}-content`}
            >
              {renderCloseButton()}

              <View className="bg-[#2B42B6]/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-[#33CFFF]/20 min-w-[280px]">
                <LoadingSpinner
                  size="large"
                  variant="inline"
                  testID={`${testID}-spinner`}
                />

                <Text
                  className="text-[#F1F5F9] text-xl font-semibold text-center mt-4 tracking-wide"
                  testID={`${testID}-text`}
                >
                  {text}
                </Text>

                {subtitle && (
                  <Text
                    className="text-[#708090] text-base text-center mt-2 tracking-wide"
                    testID={`${testID}-subtitle`}
                  >
                    {subtitle}
                  </Text>
                )}

                {renderProgressBar()}
              </View>
            </Animated.View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Modal>
  );
}

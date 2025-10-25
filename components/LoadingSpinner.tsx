import LinearGradient from '@/components/ui/LinearGradient';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';

export interface LoadingSpinnerProps {
  /** The size of the loading spinner */
  size?: 'small' | 'medium' | 'large';
  /** The text to display below the spinner */
  text?: string;
  /** The variant of the loading spinner */
  variant?: 'default' | 'card' | 'fullscreen' | 'inline';
  /** Whether to show the spinner with a background */
  showBackground?: boolean;
  /** Custom background color */
  backgroundColor?: string;
  /** Whether to show a pulsing animation */
  pulse?: boolean;
  /** Custom test ID for testing */
  testID?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  text,
  variant = 'default',
  showBackground = false,
  backgroundColor,
  pulse = true,
  testID = 'loading-spinner'
}: LoadingSpinnerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pulse) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      pulseAnimation.start();
      rotateAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotateAnimation.stop();
      };
    }
  }, [pulse, pulseAnim, rotateAnim]);

  const getSpinnerSize = () => {
    switch (size) {
      case 'small': return 'small';
      case 'medium': return 'large';
      case 'large': return 'large';
      default: return 'large';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const renderSpinner = () => (
    <Animated.View
      style={{
        transform: [
          { scale: pulseAnim },
          {
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      }}
    >
      <ActivityIndicator
        size={getSpinnerSize()}
        color="#33CFFF"
        testID={`${testID}-indicator`}
      />
    </Animated.View>
  );

  const renderContent = () => (
    <View className="justify-center items-center">
      {renderSpinner()}
      {text && (
        <Text
          className={`${getTextSize()} text-[#F1F5F9] mt-3 text-center font-medium tracking-wide`}
          testID={`${testID}-text`}
        >
          {text}
        </Text>
      )}
    </View>
  );

  // Fullscreen variant with gradient background
  if (variant === 'fullscreen') {
    return (
      <LinearGradient>
        <View className="flex-1 justify-center items-center px-8" testID={testID}>
          {renderContent()}
        </View>
      </LinearGradient>
    );
  }

  // Card variant with glassmorphism effect
  if (variant === 'card') {
    return (
      <View
        className="bg-[#2B42B6]/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-[#33CFFF]/20"
        testID={testID}
      >
        {renderContent()}
      </View>
    );
  }

  // Inline variant (minimal)
  if (variant === 'inline') {
    return (
      <View className="justify-center items-center py-4" testID={testID}>
        {renderSpinner()}
        {text && (
          <Text
            className={`${getTextSize()} text-[#708090] mt-2 text-center`}
            testID={`${testID}-text`}
          >
            {text}
          </Text>
        )}
      </View>
    );
  }

  // Default variant
  if (showBackground) {
    return (
      <View
        className={`items-center justify-center py-6 px-8 rounded-2xl ${backgroundColor || 'bg-[#021A40]/80'
          }`}
        testID={testID}
      >
        {renderContent()}
      </View>
    );
  }

  return (
    <View className="justify-center items-center py-4" testID={testID}>
      {renderContent()}
    </View>
  );
}

import { PrimaryButton } from '@/components/buttons/';
import LinearGradient from '@/components/ui/LinearGradient';
import { getRandomQuote, Quote } from '@/utils/quotes';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);

  useEffect(() => {
    setQuote(getRandomQuote());

    fadeAnim.value = withTiming(1, { duration: 1000 });
    scaleAnim.value = withTiming(1, { duration: 1000 });
  }, [fadeAnim, scaleAnim]);

  const handleExit = () => {
    fadeAnim.value = withTiming(0, { duration: 500 });

    setTimeout(() => {
      onFinish();
    }, 500);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  if (!quote) {
    return null;
  }

  return (
    <LinearGradient>
      <Animated.View
        className="flex-1 justify-center items-center px-8"
        style={animatedStyle}
      >
        <View className="mb-12">
          <Text
            className="text-5xl font-medium tracking-wide text-center text-accent"
            testID="splash-app-title"
          >
            Personal Coach
          </Text>
          <Text
            className="text-ink-muted text-center text-lg mt-2 tracking-wide"
            testID="splash-app-tagline"
          >
            Turn intention into action
          </Text>
        </View>

        <View className="bg-surface-card/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-accent/20">
          <Text
            className="text-ink-primary text-2xl font-semibold text-center leading-relaxed mb-6 tracking-wide"
            testID="splash-quote-text"
          >
            &quot;{quote.text}&quot;
          </Text>
          <Text
            className="text-ink-secondary text-lg text-center font-medium tracking-wide"
            testID="splash-quote-author"
          >
            — {quote.author}
          </Text>
        </View>

        <PrimaryButton
          title="Let's Get Started!"
          onPress={handleExit}
          className="mt-8 w-full"
          testID="splash-continue-button"
        />
      </Animated.View>
    </LinearGradient>
  );
} 
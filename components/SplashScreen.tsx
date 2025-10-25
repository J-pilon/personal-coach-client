import { PrimaryButton } from '@/components/buttons/';
import LinearGradient from '@/components/ui/LinearGradient';
import { getRandomQuote, Quote } from '@/utils/quotes';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Get a random quote when component mounts
    setQuote(getRandomQuote());

    // Animate the splash screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleExit = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  if (!quote) {
    return null;
  }

  return (
    <LinearGradient>
      <Animated.View
        className="flex-1 justify-center items-center px-8"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <View className="mb-12">
          <Text
            className="text-5xl font-medium tracking-wide text-center text-cyan-400"
            testID="splash-app-title"
          >
            Personal Coach
          </Text>
          <Text
            className="text-[#708090] text-center text-lg mt-2 tracking-wide"
            testID="splash-app-tagline"
          >
            Turn intention into action
          </Text>
        </View>

        <View className="bg-[#2B42B6]/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-[#33CFFF]/20">
          <Text
            className="text-[#F1F5F9] text-2xl font-semibold text-center leading-relaxed mb-6 tracking-wide"
            testID="splash-quote-text"
          >
            &quot;{quote.text}&quot;
          </Text>
          <Text
            className="text-[#E6FAFF] text-lg text-center font-medium tracking-wide"
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
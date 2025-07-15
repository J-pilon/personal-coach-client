import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import OnboardingWizard from '@/components/OnboardingWizard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showWizard, setShowWizard] = useState(false);

  const handleStartWizard = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    // Navigate to main app after onboarding is complete
    router.replace('/(tabs)');
  };

  if (showWizard) {
    return <OnboardingWizard onComplete={handleWizardComplete} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="rocket" size={80} color={colors.tint} />
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome to Personal Coach
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Let&apos;s create your personalized SMART goals to achieve success
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Set clear, measurable goals
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Track your progress over time
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Break down goals into actionable tasks
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Stay motivated with regular check-ins
            </Text>
          </View>
        </View>

        {/* SMART Goals Info */}
        <View style={styles.smartInfoContainer}>
          <Text style={[styles.smartTitle, { color: colors.text }]}>
            What are SMART Goals?
          </Text>
          <Text style={[styles.smartDescription, { color: colors.text }]}>
            SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound objectives that help you focus your efforts and increase your chances of achieving what you want.
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.tint }]}
          onPress={handleStartWizard}
        >
          <Text style={styles.startButtonText}>Start Creating Goals</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  smartInfoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  smartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  smartDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
}); 
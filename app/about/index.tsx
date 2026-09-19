import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface FeatureSectionProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  testID: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ title, description, icon, testID }) => (
  <View className="bg-surface-card/20 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-accent/20" testID={testID}>
    <View className="flex-row items-center mb-4">
      <View className="rounded-xl p-3 mr-4 bg-surface-muted">
        <Ionicons name={icon} size={24} color="#33CFFF" />
      </View>
      <Text className="text-ink-primary text-xl font-semibold flex-1">{title}</Text>
    </View>
    <Text className="text-ink-secondary text-base leading-6">{description}</Text>
  </View>
);

export default function AboutScreen() {
  return (
    <LinearGradient>
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {/* App Description */}
        <View className="bg-surface-card/20 backdrop-blur-sm rounded-3xl p-6 mb-8 border border-accent/20" testID="about-app-description">
          <Text className="text-ink-primary text-2xl font-semibold mb-4 text-center">
            Personal Coach
          </Text>
          <Text className="text-ink-secondary text-base leading-6 text-center">
            Turn intention into action with AI-powered task management and focused productivity.
          </Text>
        </View>

        {/* AI Suggestions Section */}
        <FeatureSection
          title="AI Task Suggestions"
          description='Our AI analyzes your SMART goals and daily patterns to suggest relevant tasks. Tap the "Assit Me" button on the Today&apos;s Focus screen to get personalized task recommendations that align with your objectives.'
          icon="bulb-outline"
          testID="about-ai-suggestions-section"
        />

        {/* Daily Focus Section */}
        <FeatureSection
          title="Today's Focus"
          description='Plan your day with focus. Choose the tasks you want to tackle, add AI-suggested ones, and manage them your way: complete them, reschedule, or set aside for later. Switch to distraction-free Focus Mode to work on one task at a time: mark it done, snooze it, or move to the next. Every focused session brings you closer to your bigger goals.'
          icon="eye-outline"
          testID="about-daily-focus-section"
        />

        {/* SMART Goals Section */}
        <FeatureSection
          title="SMART Goals"
          description="Create Specific, Measurable, Achievable, Relevant, and Time-bound goals. Set goals for different time periods (1 month, 3 months, 6 months) to track your progress systematically."
          icon="star-outline"
          testID="about-smart-goals-section"
        />

        {/* Tips Section */}
        <View className="bg-surface-card/20 backdrop-blur-sm rounded-3xl p-6 mb-8 border border-accent/20" testID="about-tips-section">
          <View className="flex-row items-center mb-4">
            <View className="rounded-xl p-3 mr-4 bg-surface-muted">
              <Ionicons name="bulb-outline" size={24} color="#33CFFF" />
            </View>
            <Text className="text-ink-primary text-xl font-semibold">Pro Tips</Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row items-start">
              <Text className="text-accent text-lg mr-3">•</Text>
              <Text className="text-ink-secondary text-base flex-1">
                Use AI suggestions regularly to discover tasks you might have missed
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-accent text-lg mr-3">•</Text>
              <Text className="text-ink-secondary text-base flex-1">
                Enter Focus Mode when you need to eliminate distractions
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-accent text-lg mr-3">•</Text>
              <Text className="text-ink-secondary text-base flex-1">
                Review your SMART goals weekly to stay aligned with your vision
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-accent text-lg mr-3">•</Text>
              <Text className="text-ink-secondary text-base flex-1">
                Keep your daily task list manageable - quality over quantity
              </Text>
            </View>
          </View>
        </View>

        {/* Version Info */}
        <View className="items-center py-4" testID="about-version-info">
          <Text className="text-ink-muted text-sm">Version 1.0.0</Text>
          <Text className="text-ink-muted text-sm mt-1">Built with ❤️ for productivity</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
} 
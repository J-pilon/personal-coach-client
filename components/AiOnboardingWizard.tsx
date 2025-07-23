import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useCreateUser } from '@/hooks/useUser';
import { useCreateMultipleSmartGoals } from '@/hooks/useSmartGoals';
import { useCreateSmartGoal } from '@/hooks/useAi';
import { useAiResponseHelpers } from '@/hooks/useAi';
import { router } from 'expo-router';
import LinearGradient from '@/components/ui/LinearGradient';
import { useCompleteOnboarding } from '@/hooks/useUser';

interface SMARTGoalData {
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
  timeframe: '1_month' | '3_months' | '6_months';
}

interface MultiPeriodSmartGoalResponse {
  one_month: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    time_bound: string;
  };
  three_months: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    time_bound: string;
  };
  six_months: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    time_bound: string;
  };
}

interface OnboardingStep {
  id: 'goal-description' | 'ai-response' | 'confirmation';
  title: string;
  subtitle: string;
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function AiOnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [goalDescription, setGoalDescription] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mockProfileId = 1

  const createSmartGoal = useCreateSmartGoal();
  const createMultipleSmartGoals = useCreateMultipleSmartGoals();
  const completeOnboarding = useCompleteOnboarding(mockProfileId)
  const { isSmartGoalResponse, formatSmartGoalResponse } = useAiResponseHelpers();

  const steps: OnboardingStep[] = [
    {
      id: 'goal-description',
      title: 'What do you want to achieve?',
      subtitle: 'Describe what you want to accomplish. We\'ll create goals for 1 month, 3 months, and 6 months!'
    },
    {
      id: 'ai-response',
      title: 'Your SMART Goals',
      subtitle: 'Here\'s what AI suggests for different time periods:'
    },
    {
      id: 'confirmation',
      title: 'Ready to save your goals?',
      subtitle: 'Review and confirm your SMART goals, or go back to edit your description.'
    }
  ];

  // Helper function to format multi-period SMART goal response
  const formatMultiPeriodSmartGoalResponse = (response: MultiPeriodSmartGoalResponse): string => {
    const formatSingleGoal = (goal: any, period: string) => {
      const parts = [];
      if (goal.specific) parts.push(`Specific: ${goal.specific}`);
      if (goal.measurable) parts.push(`Measurable: ${goal.measurable}`);
      if (goal.achievable) parts.push(`Achievable: ${goal.achievable}`);
      if (goal.relevant) parts.push(`Relevant: ${goal.relevant}`);
      if (goal.time_bound) parts.push(`Time-bound: ${goal.time_bound}`);
      return `${period}:\n${parts.join('\n')}`;
    };

    return [
      formatSingleGoal(response.one_month, '1 Month Goal'),
      '',
      formatSingleGoal(response.three_months, '3 Month Goal'),
      '',
      formatSingleGoal(response.six_months, '6 Month Goal')
    ].join('\n');
  };

  const currentStep = steps[currentStepIndex];

  const handleSubmitGoalDescription = async () => {
    if (!goalDescription.trim()) {
      Alert.alert('Missing Description', 'Please describe what you want to achieve.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createSmartGoal.mutateAsync(goalDescription.trim());
      setAiResponse(result);
      setCurrentStepIndex(1);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate your SMART goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmGoal = async () => {
    if (!aiResponse || !isSmartGoalResponse(aiResponse)) {
      Alert.alert('Error', 'Invalid goal data. Please try again.');
      return;
    }

    try {
      // Create goals for all three time periods
      const smartGoals: SMARTGoalData[] = [
        {
          title: `${goalDescription} (1 Month)`,
          specific: aiResponse.response.one_month?.specific || '',
          measurable: aiResponse.response.one_month?.measurable || '',
          achievable: aiResponse.response.one_month?.achievable || '',
          relevant: aiResponse.response.one_month?.relevant || '',
          time_bound: aiResponse.response.one_month?.time_bound || '1 month',
          timeframe: '1_month'
        },
        {
          title: `${goalDescription} (3 Months)`,
          specific: aiResponse.response.three_months?.specific || '',
          measurable: aiResponse.response.three_months?.measurable || '',
          achievable: aiResponse.response.three_months?.achievable || '',
          relevant: aiResponse.response.three_months?.relevant || '',
          time_bound: aiResponse.response.three_months?.time_bound || '3 months',
          timeframe: '3_months'
        },
        {
          title: `${goalDescription} (6 Months)`,
          specific: aiResponse.response.six_months?.specific || '',
          measurable: aiResponse.response.six_months?.measurable || '',
          achievable: aiResponse.response.six_months?.achievable || '',
          relevant: aiResponse.response.six_months?.relevant || '',
          time_bound: aiResponse.response.six_months?.time_bound || '6 months',
          timeframe: '6_months'
        }
      ];

      await createMultipleSmartGoals.mutateAsync(smartGoals);
      await completeOnboarding.mutateAsync()

      onComplete();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save your goals. Please try again.');
    }
  };

  const handleEditGoal = () => {
    setCurrentStepIndex(0);
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              backgroundColor: '#33CFFF'
            }
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: '#F1F5F9' }]}>
        Step {currentStepIndex + 1} of {steps.length}
      </Text>
    </View>
  );

  const renderGoalDescriptionStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: '#F1F5F9' }]}>
          Describe what you want to achieve
        </Text>
        <Text style={[styles.inputDescription, { color: '#E6FAFF' }]}>
          Tell us what you want to accomplish. We&apos;ll create SMART goals for 1 month, 3 months, and 6 months. For example: &ldquo;I want to improve my fitness and run a marathon&rdquo; or &ldquo;I want to learn web development and build my own website&rdquo;
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: '#13203a',
              borderColor: '#33CFFF',
              color: '#F1F5F9'
            }
          ]}
          placeholder="e.g., I want to improve my fitness and run a marathon, or learn web development and build my own website..."
          placeholderTextColor="#708090"
          value={goalDescription}
          onChangeText={setGoalDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          {
            backgroundColor: isLoading ? '#708090' : '#33CFFF',
            marginTop: 20
          }
        ]}
        onPress={handleSubmitGoalDescription}
        disabled={isLoading}
      >
        <Text style={styles.primaryButtonText}>
          {isLoading ? 'Generating your SMART goal...' : 'Generate SMART Goal'}
        </Text>
        {!isLoading && <Ionicons name="sparkles" size={20} color="#021A40" style={{ marginLeft: 8 }} />}
      </TouchableOpacity>
    </View>
  );

  const renderAiResponseStep = () => {
    if (!aiResponse || !isSmartGoalResponse(aiResponse)) {
      return (
        <View style={styles.stepContainer}>
          <Text style={[styles.errorText, { color: '#ff6b6b' }]}>
            Unable to generate SMART goals. Please try again.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.stepContainer}>
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#33CFFF" />
            <Text style={[styles.responseTitle, { color: '#F1F5F9' }]}>
              Your SMART Goals
            </Text>
          </View>

          <View style={styles.smartGoalContainer}>
            <Text style={[styles.smartGoalText, { color: '#E6FAFF', lineHeight: 24 }]}>
              {formatMultiPeriodSmartGoalResponse(aiResponse.response)}
            </Text>
          </View>

          <View style={styles.responseDetails}>
            <Text style={[styles.detailText, { color: '#708090' }]}>
              Context used: {aiResponse.context_used ? 'Yes' : 'No'}
            </Text>
            <Text style={[styles.detailText, { color: '#708090' }]}>
              Request ID: {aiResponse.request_id}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: '#33CFFF' }]}
            onPress={handleEditGoal}
          >
            <Ionicons name="create-outline" size={20} color="#33CFFF" />
            <Text style={[styles.secondaryButtonText, { color: '#33CFFF' }]}>
              Edit Description
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#33CFFF' }]}
            onPress={() => setCurrentStepIndex(2)}
          >
            <Text style={styles.primaryButtonText}>These Look Good!</Text>
            <Ionicons name="arrow-forward" size={20} color="#021A40" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderConfirmationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.confirmationContainer}>
        <View style={styles.confirmationHeader}>
          <Ionicons name="checkmark-circle" size={32} color="#33CFFF" />
          <Text style={[styles.confirmationTitle, { color: '#F1F5F9' }]}>
            Ready to Save Your Goals?
          </Text>
        </View>

        <Text style={[styles.confirmationText, { color: '#E6FAFF' }]}>
          Your SMART goals for 1 month, 3 months, and 6 months will be saved and you can start tracking your progress. You can always edit or add more goals later.
        </Text>

        <View style={styles.smartGoalPreview}>
          <Text style={[styles.previewTitle, { color: '#F1F5F9' }]}>
            Goals Preview:
          </Text>
          <Text style={[styles.previewText, { color: '#E6FAFF', lineHeight: 20 }]}>
            {aiResponse && isSmartGoalResponse(aiResponse)
              ? formatMultiPeriodSmartGoalResponse(aiResponse.response)
              : 'Goals preview not available'
            }
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: '#33CFFF' }]}
          onPress={handleEditGoal}
        >
          <Ionicons name="arrow-back" size={20} color="#33CFFF" />
          <Text style={[styles.secondaryButtonText, { color: '#33CFFF' }]}>
            Edit Goals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: '#33CFFF' }]}
          onPress={handleConfirmGoal}
        >
          <Text style={styles.primaryButtonText}>Save & Continue</Text>
          <Ionicons name="checkmark" size={20} color="#021A40" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep.id) {
      case 'goal-description':
        return renderGoalDescriptionStep();
      case 'ai-response':
        return renderAiResponseStep();
      case 'confirmation':
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  return (
    <LinearGradient>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: '#F1F5F9' }]}>
              {currentStep.title}
            </Text>
            <Text style={[styles.subtitle, { color: '#E6FAFF' }]}>
              {currentStep.subtitle}
            </Text>
          </View>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Current Step Content */}
          {renderCurrentStep()}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#13203a',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  stepContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputDescription: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#021A40',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  responseContainer: {
    backgroundColor: '#13203a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#33CFFF',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  responseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  smartGoalContainer: {
    backgroundColor: '#1a2a4a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  smartGoalText: {
    fontSize: 16,
  },
  responseDetails: {
    borderTopWidth: 1,
    borderTopColor: '#2a3a5a',
    paddingTop: 12,
  },
  detailText: {
    fontSize: 12,
    marginBottom: 4,
  },
  confirmationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  confirmationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  smartGoalPreview: {
    backgroundColor: '#13203a',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 
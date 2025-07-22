import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useCreateUser } from '@/hooks/useUser';
import { useCreateMultipleSmartGoals } from '@/hooks/useSmartGoals';
import { router } from 'expo-router';
import LinearGradient from '@/components/ui/LinearGradient';

interface SMARTGoalData {
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
  timeframe: '1_month' | '3_months' | '6_months';
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentStep, setCurrentStep] = useState(0);
  const [goals, setGoals] = useState<SMARTGoalData[]>([]);
  const [currentGoal, setCurrentGoal] = useState<Partial<SMARTGoalData>>({});
  const createUser = useCreateUser();
  const createMultipleSmartGoals = useCreateMultipleSmartGoals();

  const timeframes = [
    { key: '1_month', label: '1 Month', description: 'Short-term goals to achieve quickly' },
    { key: '3_months', label: '3 Months', description: 'Medium-term goals for steady progress' },
    { key: '6_months', label: '6 Months', description: 'Long-term goals for significant achievement' },
  ];

  const currentTimeframe = timeframes[currentStep];

  const questions = [
    {
      key: 'title',
      label: 'What is your main goal?',
      placeholder: 'e.g., Improve my technical skills',
      description: 'Start with a clear, specific objective you want to achieve.'
    },
    {
      key: 'specific',
      label: 'What specifically do you want to accomplish?',
      placeholder: 'e.g., Learn React Native and build 2 mobile apps',
      description: 'Be as specific as possible about what you want to achieve.'
    },
    {
      key: 'measurable',
      label: 'How will you measure your progress?',
      placeholder: 'e.g., Complete 3 courses and deploy working apps',
      description: 'Define clear metrics to track your success.'
    },
    {
      key: 'achievable',
      label: 'What steps will you take to achieve this?',
      placeholder: 'e.g., Study 2 hours daily and practice building projects',
      description: 'Break down the goal into actionable steps.'
    },
    {
      key: 'relevant',
      label: 'Why is this goal important to you?',
      placeholder: 'e.g., Will help advance my career as a mobile developer',
      description: 'Connect the goal to your bigger picture and values.'
    },
    {
      key: 'time_bound',
      label: 'What is your timeline and deadline?',
      placeholder: 'e.g., Complete by end of Q2 2024',
      description: 'Set a clear deadline to stay motivated and focused.'
    }
  ];

  const handleInputChange = (key: string, value: string) => {
    setCurrentGoal(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!currentGoal.title || !currentGoal.specific || !currentGoal.measurable ||
      !currentGoal.achievable || !currentGoal.relevant || !currentGoal.time_bound) {
      Alert.alert('Incomplete Goal', 'Please fill in all fields to continue.');
      return;
    }

    const completeGoal: SMARTGoalData = {
      ...currentGoal as SMARTGoalData,
      timeframe: currentTimeframe.key as '1_month' | '3_months' | '6_months'
    };

    setGoals(prev => [...prev, completeGoal]);
    setCurrentGoal({});

    if (currentStep < timeframes.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setCurrentGoal({});
    }
  };

  const handleComplete = async () => {
    try {
      // Create user and profile
      await createUser.mutateAsync({
        email: 'user@example.com',
        password: 'password123',
        password_confirmation: 'password123'
      });

      // Save SMART goals to the backend
      await createMultipleSmartGoals.mutateAsync(goals);

      onComplete();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentStep + 1) / timeframes.length) * 100}%`,
              backgroundColor: '#33CFFF'
            }
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: '#F1F5F9' }]}>
        Step {currentStep + 1} of {timeframes.length}
      </Text>
    </View>
  );

  const renderQuestion = (question: any) => (
    <View key={question.key} style={styles.questionContainer}>
      <Text style={[styles.questionLabel, { color: '#F1F5F9' }]}>
        {question.label}
      </Text>
      <Text style={[styles.questionDescription, { color: '#E6FAFF' }]}>
        {question.description}
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
        placeholder={question.placeholder}
        placeholderTextColor="#708090"
        value={currentGoal[question.key as keyof SMARTGoalData] || ''}
        onChangeText={(text) => handleInputChange(question.key, text)}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  return (
    <LinearGradient>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: '#F1F5F9' }]}>
              Create Your {currentTimeframe.label} Goal
            </Text>
            <Text style={[styles.subtitle, { color: '#E6FAFF' }]}>
              {currentTimeframe.description}
            </Text>
          </View>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Questions */}
          <View style={styles.questionsContainer}>
            {questions.map(renderQuestion)}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.backButton, { borderColor: '#33CFFF' }]}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={20} color="#33CFFF" />
                <Text style={[styles.backButtonText, { color: '#33CFFF' }]}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                {
                  backgroundColor: '#33CFFF',
                  marginLeft: currentStep > 0 ? 10 : 0
                }
              ]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === timeframes.length - 1 ? 'Complete' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#021A40" />
            </TouchableOpacity>
          </View>
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
  questionsContainer: {
    marginBottom: 30,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionDescription: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#021A40',
    marginRight: 8,
  },
}); 
import LinearGradient from '@/components/ui/LinearGradient';
import { useToast } from '@/components/ToastManager';
import ScrollView from '@/components/util/ScrollView';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { requestPasswordReset } = useAuth();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <LinearGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
            paddingBottom: 40
          }}
        >
          <View>
            <View className="mb-8">
              <Text testID="forgot-password-title" className="text-[28px] font-semibold text-center text-[#F1F5F9] tracking-wide mb-2">
                {isSubmitted ? 'Check Your Email' : 'Forgot Password'}
              </Text>
              <Text testID="forgot-password-subtitle" className="text-center text-[#E6FAFF] text-lg">
                {isSubmitted
                  ? 'If that email is registered, we’ve sent password reset instructions.'
                  : 'Enter your email and we’ll send you a reset link.'}
              </Text>
            </View>

            {!isSubmitted && (
              <View className="mb-8">
                <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                  Email
                </Text>
                <TextInput
                  testID="forgot-password-email-input"
                  className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    shadowColor: '#274B8E',
                    shadowOpacity: 0.10,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 3 }
                  }}
                />
              </View>
            )}

            {!isSubmitted && (
              <TouchableOpacity
                testID="forgot-password-submit-button"
                className={`w-full py-4 rounded-xl shadow-md mb-8 ${isLoading ? 'bg-[#808080]' : 'bg-cyan-400'}`}
                onPress={handleSubmit}
                disabled={isLoading}
                style={{
                  shadowColor: isLoading ? '#808080' : '#33CFFF',
                  shadowOpacity: isLoading ? 0.12 : 0.25,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 }
                }}
              >
                {isLoading ? (
                  <ActivityIndicator testID="forgot-password-loading-indicator" color="#021A40" />
                ) : (
                  <Text className="text-lg font-semibold text-center text-[#021A40]">
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <View className="flex-row justify-center">
              <TouchableOpacity testID="forgot-password-back-link" onPress={handleBackToLogin}>
                <Text className="font-semibold text-cyan-400">
                  {isSubmitted ? 'Back to Sign In' : 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

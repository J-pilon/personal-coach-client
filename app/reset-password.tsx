import LinearGradient from '@/components/ui/LinearGradient';
import { useToast } from '@/components/ToastManager';
import ScrollView from '@/components/util/ScrollView';
import { useAuth } from '@/hooks/useAuth';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ reset_password_token?: string }>();
  const token = typeof params.reset_password_token === 'string' ? params.reset_password_token : '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!password || !passwordConfirmation) {
      toast.error('Please fill in both fields');
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password, passwordConfirmation);
      toast.success('Password reset successfully. Please sign in.');
      router.replace('/auth/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/auth/login');
  };

  if (!token) {
    return (
      <LinearGradient>
        <View className="flex-1 justify-center px-6">
          <Text testID="reset-password-invalid-title" className="text-[24px] font-semibold text-center text-[#F1F5F9] mb-3">
            Invalid Reset Link
          </Text>
          <Text testID="reset-password-invalid-subtitle" className="text-center text-[#E6FAFF] text-lg mb-8">
            This reset link is missing or malformed. Request a new one to continue.
          </Text>
          <TouchableOpacity
            testID="reset-password-invalid-back-button"
            className="py-4 w-full bg-cyan-400 rounded-xl shadow-md"
            onPress={handleBackToLogin}
          >
            <Text className="text-lg font-semibold text-center text-[#021A40]">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

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
              <Text testID="reset-password-title" className="text-[28px] font-semibold text-center text-[#F1F5F9] tracking-wide mb-2">
                Reset Password
              </Text>
              <Text testID="reset-password-subtitle" className="text-center text-[#E6FAFF] text-lg">
                Choose a new password to finish.
              </Text>
            </View>

            <View className="mb-8">
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                  New Password
                </Text>
                <TextInput
                  testID="reset-password-password-input"
                  className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                  placeholder="Enter new password"
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  style={{
                    shadowColor: '#274B8E',
                    shadowOpacity: 0.10,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 3 }
                  }}
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                  Confirm Password
                </Text>
                <TextInput
                  testID="reset-password-confirmation-input"
                  className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                  placeholder="Confirm new password"
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  style={{
                    shadowColor: '#274B8E',
                    shadowOpacity: 0.10,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 3 }
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              testID="reset-password-submit-button"
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
                <ActivityIndicator testID="reset-password-loading-indicator" color="#021A40" />
              ) : (
                <Text className="text-lg font-semibold text-center text-[#021A40]">
                  Reset Password
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <TouchableOpacity testID="reset-password-back-link" onPress={handleBackToLogin}>
                <Text className="font-semibold text-cyan-400">Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

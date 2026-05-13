import LinearGradient from '@/components/ui/LinearGradient';
import { useToast } from '@/components/ToastManager';
import ScrollView from '@/components/util/ScrollView';
import { useAuth } from '@/hooks/useAuth';
import { passwordSchema } from '@/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

const passwordResetConfirmSchema = z
  .object({
    code: z.string().trim().min(1, 'Reset code is required'),
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });

type PasswordResetConfirmFormValues = z.infer<typeof passwordResetConfirmSchema>;

const fieldErrorClassName = 'mt-1 text-xs text-red-400';

export default function PasswordResetConfirmScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { resetPassword, requestPasswordReset } = useAuth();
  const toast = useToast();

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<PasswordResetConfirmFormValues>({
    resolver: zodResolver(passwordResetConfirmSchema),
    mode: 'onChange',
    defaultValues: { code: '', password: '', passwordConfirmation: '' },
  });

  const onSubmit = async (values: PasswordResetConfirmFormValues) => {
    setIsLoading(true);
    try {
      await resetPassword(values.code.trim(), values.password, values.passwordConfirmation);
      toast.success('Password reset successfully. Please sign in.');
      router.replace('/auth/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Go back and enter your email to resend the code');
      router.replace('/auth/forgot-password');
      return;
    }

    setIsResending(true);
    try {
      await requestPasswordReset(email);
      toast.success('Reset code resent. Check your email.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not resend the code');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => router.replace('/auth/login');

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
              <Text testID="password-reset-confirm-title" className="text-[28px] font-semibold text-center text-[#F1F5F9] tracking-wide mb-2">
                Enter Reset Code
              </Text>
              <Text testID="password-reset-confirm-subtitle" className="text-center text-[#E6FAFF] text-lg">
                {email
                  ? `Enter the code we sent to ${email} and choose a new password.`
                  : 'Enter the code from your email and choose a new password.'}
              </Text>
            </View>

            <View className="mb-8">
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                  Reset Code
                </Text>
                <Controller
                  control={control}
                  name="code"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      testID="password-reset-confirm-code-input"
                      className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                      placeholder="Paste the code from your email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        shadowColor: '#274B8E',
                        shadowOpacity: 0.10,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 3 }
                      }}
                    />
                  )}
                />
                {errors.code && (
                  <Text className={fieldErrorClassName} testID="password-reset-confirm-code-error">
                    {errors.code.message}
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                  New Password
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      testID="password-reset-confirm-password-input"
                      className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                      placeholder="Enter new password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
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
                  )}
                />
                {errors.password && (
                  <Text className={fieldErrorClassName} testID="password-reset-confirm-password-error">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                  Confirm Password
                </Text>
                <Controller
                  control={control}
                  name="passwordConfirmation"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      testID="password-reset-confirm-confirmation-input"
                      className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                      placeholder="Confirm new password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
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
                  )}
                />
                {errors.passwordConfirmation && (
                  <Text className={fieldErrorClassName} testID="password-reset-confirm-confirmation-error">
                    {errors.passwordConfirmation.message}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              testID="password-reset-confirm-submit-button"
              className={`w-full py-4 rounded-xl shadow-md mb-6 ${isLoading || !isValid ? 'bg-[#808080]' : 'bg-cyan-400'}`}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading || !isValid}
              style={{
                shadowColor: isLoading ? '#808080' : '#33CFFF',
                shadowOpacity: isLoading ? 0.12 : 0.25,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 }
              }}
            >
              {isLoading ? (
                <ActivityIndicator testID="password-reset-confirm-loading-indicator" color="#021A40" />
              ) : (
                <Text className="text-lg font-semibold text-center text-[#021A40]">
                  Reset Password
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-between mb-2">
              <TouchableOpacity testID="password-reset-confirm-back-link" onPress={handleBackToLogin}>
                <Text className="font-semibold text-cyan-400">Back to Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity testID="password-reset-confirm-resend-link" onPress={handleResend} disabled={isResending}>
                <Text className={`font-semibold ${isResending ? 'text-[#808080]' : 'text-cyan-400'}`}>
                  {isResending ? 'Resending…' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

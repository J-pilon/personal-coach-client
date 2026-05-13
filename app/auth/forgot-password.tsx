import LinearGradient from '@/components/ui/LinearGradient';
import { useToast } from '@/components/ToastManager';
import ScrollView from '@/components/util/ScrollView';
import { useAuth } from '@/hooks/useAuth';
import { emailSchema } from '@/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
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

const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

const fieldErrorClassName = 'mt-1 text-xs text-red-400';

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { requestPasswordReset } = useAuth();
  const toast = useToast();

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      toast.success('If that email is registered, we’ve sent a reset code.');
      router.replace({
        pathname: '/auth/password-reset-confirm',
        params: { email },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send reset instructions');
    } finally {
      setIsLoading(false);
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
              <Text testID="forgot-password-title" className="text-[28px] font-semibold text-center text-[#F1F5F9] tracking-wide mb-2">
                Forgot Password
              </Text>
              <Text testID="forgot-password-subtitle" className="text-center text-[#E6FAFF] text-lg">
                Enter your email and we’ll send you a reset code.
              </Text>
            </View>

            <View className="mb-8">
              <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                Email
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    testID="forgot-password-email-input"
                    className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
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
                )}
              />
              {errors.email && (
                <Text className={fieldErrorClassName} testID="forgot-password-email-error">
                  {errors.email.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              testID="forgot-password-submit-button"
              className={`w-full py-4 rounded-xl shadow-md mb-8 ${isLoading || !isValid ? 'bg-[#808080]' : 'bg-cyan-400'}`}
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
                <ActivityIndicator testID="forgot-password-loading-indicator" color="#021A40" />
              ) : (
                <Text className="text-lg font-semibold text-center text-[#021A40]">
                  Send Reset Code
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <TouchableOpacity testID="forgot-password-back-link" onPress={handleBackToLogin}>
                <Text className="font-semibold text-cyan-400">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

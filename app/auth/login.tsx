import LinearGradient from '@/components/ui/LinearGradient';
import { useToast } from '@/components/ToastManager';
import ScrollView from '@/components/util/ScrollView';
import { useAuth } from '@/hooks/useAuth';
import { emailSchema, passwordSchema } from '@/models';
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

const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const fieldErrorClassName = 'mt-1 text-xs text-red-400';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const toast = useToast();

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      router.replace('/(tabs)');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => router.push('/auth/signup');
  const handleForgotPassword = () => router.push('/auth/forgot-password');

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
              <Text testID="login-title" className="text-[28px] font-semibold text-center text-[#F1F5F9] tracking-wide mb-2">
                Welcome Back
              </Text>
              <Text testID="login-subtitle" className="text-center text-[#E6FAFF] text-lg">
                Sign in to your account
              </Text>
            </View>

            <View className="mb-8">
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                  Email
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      testID="login-email-input"
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
                  <Text className={fieldErrorClassName} testID="login-email-error">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                  Password
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      testID="login-password-input"
                      className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                      placeholder="Enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
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
                {errors.password && (
                  <Text className={fieldErrorClassName} testID="login-password-error">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              <View className="items-end mt-3">
                <TouchableOpacity testID="login-forgot-password-link" onPress={handleForgotPassword}>
                  <Text className="text-sm font-semibold text-cyan-400">Forgot password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              testID="login-signin-button"
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
                <ActivityIndicator testID="login-loading-indicator" color="#021A40" />
              ) : (
                <Text className="text-lg font-semibold text-center text-[#021A40]">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="text-[#E6FAFF]">Don&apos;t have an account? </Text>
              <TouchableOpacity testID="login-signup-link" onPress={handleSignUp}>
                <Text className="font-semibold text-cyan-400">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

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

const signupFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

const fieldErrorClassName = 'mt-1 text-xs text-red-400';

export default function SignupScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const toast = useToast();

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', passwordConfirmation: '' },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.passwordConfirmation);
      router.replace('/(tabs)');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => router.push('/auth/login');

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
              <Text testID="signup-title" className="text-[28px] font-semibold text-center text-[#F1F5F9] tracking-wide mb-2">
                Create Account
              </Text>
              <Text testID="signup-subtitle" className="text-center text-[#E6FAFF] text-lg">
                Sign up to get started
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
                      testID="signup-email-input"
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
                  <Text className={fieldErrorClassName} testID="signup-email-error">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                  Password
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      testID="signup-password-input"
                      className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                      placeholder="Enter your password"
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
                  <Text className={fieldErrorClassName} testID="signup-password-error">
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
                      testID="signup-password-confirmation-input"
                      className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                      placeholder="Confirm your password"
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
                  <Text className={fieldErrorClassName} testID="signup-password-confirmation-error">
                    {errors.passwordConfirmation.message}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              testID="signup-signup-button"
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
                <ActivityIndicator testID="signup-loading-indicator" color="#021A40" />
              ) : (
                <Text className="text-lg font-semibold text-center text-[#021A40]">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="text-[#E6FAFF]">Already have an account? </Text>
              <TouchableOpacity testID="signup-signin-link" onPress={handleSignIn}>
                <Text className="font-semibold text-cyan-400">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

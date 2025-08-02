import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !passwordConfirmation) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, passwordConfirmation);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Sign Up Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View className="flex-1 justify-center px-6 bg-white">
        <View className="space-y-6">
          <View className="space-y-2">
            <Text testID="signup-title" className="text-3xl font-bold text-center text-gray-900">
              Create Account
            </Text>
            <Text testID="signup-subtitle" className="text-center text-gray-600">
              Sign up to get started
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Email
              </Text>
              <TextInput
                testID="signup-email-input"
                className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:border-blue-500"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Password
              </Text>
              <TextInput
                testID="signup-password-input"
                className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:border-blue-500"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Confirm Password
              </Text>
              <TextInput
                testID="signup-password-confirmation-input"
                className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:border-blue-500"
                placeholder="Confirm your password"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <TouchableOpacity
            testID="signup-signup-button"
            className={`w-full py-3 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-blue-600'
              }`}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator testID="signup-loading-indicator" color="white" />
            ) : (
              <Text className="text-lg font-semibold text-center text-white">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity testID="signup-signin-link" onPress={handleSignIn}>
              <Text className="font-semibold text-blue-600">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
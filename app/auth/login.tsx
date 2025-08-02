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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Sign In Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View className="flex-1 justify-center px-6 bg-white">
        <View className="space-y-6">
          <View className="space-y-2">
            <Text testID="login-title" className="text-3xl font-bold text-center text-gray-900">
              Welcome Back
            </Text>
            <Text testID="login-subtitle" className="text-center text-gray-600">
              Sign in to your account
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Email
              </Text>
              <TextInput
                testID="login-email-input"
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
                testID="login-password-input"
                className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:border-blue-500"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <TouchableOpacity
            testID="login-signin-button"
            className={`w-full py-3 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-blue-600'
              }`}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator testID="login-loading-indicator" color="white" />
            ) : (
              <Text className="text-lg font-semibold text-center text-white">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity testID="login-signup-link" onPress={handleSignUp}>
              <Text className="font-semibold text-blue-600">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
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
                <TextInput
                  testID="login-email-input"
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

              <View>
                <Text className="mb-2 text-sm font-medium text-[#E6FAFF]">
                  Password
                </Text>
                <TextInput
                  testID="login-password-input"
                  className="px-4 py-4 w-full rounded-xl border border-[#2B42B6] bg-[#13203a] text-[#F1F5F9] placeholder:text-[#708090]"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
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
              </View>
            </View>

            <TouchableOpacity
              testID="login-signin-button"
              className={`w-full py-4 rounded-xl shadow-md mb-8 ${isLoading ? 'bg-[#808080]' : 'bg-cyan-400'}`}
              onPress={handleSignIn}
              disabled={isLoading}
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
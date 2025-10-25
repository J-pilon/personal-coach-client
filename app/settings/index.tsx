import { PrimaryButton, SecondaryButton } from '@/components/buttons/';
import { LoadingSkeleton, LoadingSpinner } from '@/components/loading';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { useAiSettings } from '../../hooks/useAiSettings';

export default function SettingsScreen() {
  const {
    setApiKey,
    clearApiKey,
    getStoredApiKey,
    usageInfo,
    isLoading,
    error
  } = useAiSettings();

  const [inputKey, setInputKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [storedApiKey, setStoredApiKey] = useState<string | null>(null);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(false);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        setIsLoadingApiKey(true);
        const apiKey = await getStoredApiKey();
        setStoredApiKey(apiKey);
        setInputKey(apiKey || '');
      } catch (error) {
        console.error('Error loading API key:', error);
      } finally {
        setIsLoadingApiKey(false);
      }
    };

    loadApiKey();
  }, [getStoredApiKey]);

  const handleSaveKey = async () => {
    if (!inputKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    try {
      await setApiKey(inputKey.trim());
      setStoredApiKey(inputKey.trim());
      setIsEditing(false);
      Alert.alert('Success', 'Your API key has been saved securely');
    } catch {
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    }
  };

  const handleClearKey = () => {
    Alert.alert(
      'Clear API Key',
      'Are you sure you want to clear your API key? You will be limited to 3 AI requests per day.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearApiKey();
              setStoredApiKey(null);
              setInputKey('');
              Alert.alert('Success', 'API key cleared');
            } catch {
              Alert.alert('Error', 'Failed to clear API key');
            }
          },
        },
      ]
    );
  };

  const renderUsageInfo = () => {
    if (isLoading) {
      return (
        <View className="bg-[#2B42B6] rounded-2xl p-4 mb-4">
          <LoadingSkeleton
            type="text"
            count={2}
            height={20}
            testID="usage-info-skeleton"
          />
        </View>
      );
    }

    if (usageInfo?.using_own_key) {
      return (
        <View className="bg-[#2B42B6] rounded-2xl p-4 mb-4">
          <View className="flex-row justify-center items-center mb-2">
            <Ionicons name="checkmark-circle" size={20} color="#22d3ee" />
            <Text className="text-[#F1F5F9] text-lg font-semibold ml-2">
              Using your own key
            </Text>
          </View>
          <Text className="text-[#E6FAFF] text-center">
            Unlimited requests
          </Text>
        </View>
      );
    }

    return (
      <View className="bg-[#2B42B6] rounded-2xl p-4 mb-4">
        <View className="flex-row justify-center items-center mb-2">
          <Ionicons name="time-outline" size={20} color="#22d3ee" />
          <Text className="text-[#F1F5F9] text-lg font-semibold ml-2">
            Using demo key
          </Text>
        </View>
        <Text className="text-[#E6FAFF] text-center">
          {usageInfo?.remaining} requests remaining today
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient>
      <ScrollView contentContainerStyle={{ paddingTop: 32, marginHorizontal: 16 }}>
        {renderUsageInfo()}

        {/* AI Features Explanation */}
        <View className="bg-[#2B42B6] rounded-2xl p-4 mb-6">
          <Text className="text-[#F1F5F9] text-lg font-semibold mb-2">
            AI Features
          </Text>
          <Text className="text-[#E6FAFF] text-sm leading-5">
            Our AI helps you create SMART goals and prioritize tasks.
            You can use the demo key (3 requests/day) or add your own OpenAI key for unlimited access.
          </Text>
        </View>

        {/* API Key Section */}
        <View className="bg-[#2B42B6] rounded-2xl p-4 mb-6">
          <Text className="text-[#F1F5F9] text-lg font-semibold mb-4">
            OpenAI API Key
          </Text>

          <Text className="text-[#E6FAFF] text-sm mb-4 leading-5">
            Don&apos;t want to wait? You can use your own OpenAI API key for unlimited access.
          </Text>

          <View className="mb-4">
            <Text className="text-[#E6FAFF] text-sm mb-2 font-medium">
              How to get your key:
            </Text>
            <View className="p-2 bg-transparent rounded-xl border border-cyan-400">
              <Text className="text-sm text-cyan-400">1. Go to https://platform.openai.com/account/api-keys</Text>
              <Text className="text-sm text-cyan-400">2. Log in or create a free OpenAI account</Text>
              <Text className="text-sm text-cyan-400">3. Click &quot;Create new secret key&quot;</Text>
              <Text className="text-sm text-cyan-400">4. Copy and paste the key below</Text>
              <Text className="text-sm text-cyan-400">5. We&apos;ll save it securely and use it for your AI requests</Text>
            </View>
          </View>

          {isLoadingApiKey ? (
            <View className="bg-[#154FA6] rounded-xl p-4">
              <LoadingSpinner
                size="small"
                text="Loading..."
                variant="inline"
                testID="api-key-loading"
              />
            </View>
          ) : isEditing ? (
            <View className="">
              <TextInput
                value={inputKey}
                onChangeText={setInputKey}
                placeholder="Paste your OpenAI API key here"
                placeholderTextColor="#fff"
                className="bg-[#154FA6] mb-4 rounded-xl p-4 text-white text-sm border border-cyan-400"
                secureTextEntry
                testID="api-key-input"
              />
              <View className="gap-4">
                <PrimaryButton
                  title="Save Key"
                  onPress={handleSaveKey}
                  className="flex-1 mb-2"
                  testID="save-key-button"
                />
                <SecondaryButton
                  title="Cancel"
                  onPress={() => {
                    setIsEditing(false);
                    setInputKey(storedApiKey || '');
                  }}
                  testID="cancel-button"
                />
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              {storedApiKey ? (
                <View className="bg-[#154FA6] rounded-xl p-4">
                  <Text className="text-[#22d3ee] text-sm font-medium">
                    Key saved ✓
                  </Text>
                  <Text className="mt-1 text-xs text-white">
                    Your API key is securely stored
                  </Text>
                </View>
              ) : (
                <View className="bg-[#154FA6] rounded-xl p-4 mb-4 border border-cyan-400">
                  <Text className="text-sm text-white">
                    No API key saved
                  </Text>
                </View>
              )}

              <View className="gap-4">
                <PrimaryButton
                  title={storedApiKey ? "Change Key" : "Add Key"}
                  onPress={() => setIsEditing(true)}
                  className="flex-1"
                  testID={storedApiKey ? "change-key-button" : "add-key-button"}
                />
                {storedApiKey && (
                  <SecondaryButton
                    title="Clear Key"
                    onPress={handleClearKey}
                    testID="clear-key-button"
                  />
                )}
              </View>
            </View>
          )}
        </View>

        {/* Error Display */}
        {error && (
          <View className="p-4 mb-4 rounded-xl border bg-red-500/20 border-red-500/30">
            <Text className="text-sm text-center text-red-300">
              Error: {error}
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
} 
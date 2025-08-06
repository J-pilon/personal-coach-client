import { createTicket, DiagnosticsData, TicketData } from '@/api/tickets';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

type TicketKind = 'bug' | 'feedback';

interface FormData {
  kind: TicketKind;
  title: string;
  description: string;
}

export default function SupportFeedbackScreen() {
  const { user } = useAuth();
  const [selectedKind, setSelectedKind] = useState<TicketKind>('bug');
  const [formData, setFormData] = useState<FormData>({
    kind: 'bug',
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDiagnostics = (): DiagnosticsData => ({
    app_version: Application.nativeApplicationVersion || '1.0.0',
    build_number: Application.nativeBuildVersion || '1',
    device_model: Device.modelName || 'Unknown',
    os_version: Device.osVersion || 'Unknown',
    locale: Device.locale || 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    network_state: 'online', // TODO: Implement network detection
    user_id: user?.id?.toString()
  });

  const getPromptText = (kind: TicketKind): string => {
    if (kind === 'bug') {
      return 'Please describe the issue you encountered:\n\n• What were you trying to do?\n• What happened instead?\n• Steps to reproduce the issue\n• Any error messages you saw';
    } else {
      return 'Please share your feedback:\n\n• What feature or improvement are you suggesting?\n• How would this help you?\n• Any other thoughts or suggestions?';
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Missing Information', 'Please fill in both title and description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData: TicketData = {
        kind: selectedKind,
        title: formData.title.trim(),
        description: formData.description.trim(),
        source: 'app'
      };

      const diagnostics = getDiagnostics();
      await createTicket(ticketData, diagnostics);

      Alert.alert(
        'Thank You!',
        'Your submission has been received. We\'ll review it and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient>
      <ScrollView className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-[#E6FAFF] text-lg font-semibold mb-4">
            What can we help you with?
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setSelectedKind('bug')}
              className={`flex-1 rounded-2xl p-4 border-2 ${selectedKind === 'bug'
                ? 'border-[#33CFFF] bg-[#154FA6]'
                : 'border-[#274B8E] bg-[#2B42B6]'
                }`}
            >
              <View className="items-center">
                <Ionicons
                  name="bug-outline"
                  size={32}
                  color={selectedKind === 'bug' ? '#33CFFF' : '#E6FAFF'}
                />
                <Text
                  className={`text-center mt-2 font-semibold ${selectedKind === 'bug' ? 'text-[#33CFFF]' : 'text-[#E6FAFF]'
                    }`}
                >
                  Report a Bug
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setSelectedKind('feedback')}
              className={`flex-1 rounded-2xl p-4 border-2 ${selectedKind === 'feedback'
                ? 'border-[#33CFFF] bg-[#154FA6]'
                : 'border-[#274B8E] bg-[#2B42B6]'
                }`}
            >
              <View className="items-center">
                <Ionicons
                  name="chatbubble-outline"
                  size={32}
                  color={selectedKind === 'feedback' ? '#33CFFF' : '#E6FAFF'}
                />
                <Text
                  className={`text-center mt-2 font-semibold ${selectedKind === 'feedback' ? 'text-[#33CFFF]' : 'text-[#E6FAFF]'
                    }`}
                >
                  Share Feedback
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-[#E6FAFF] text-lg font-semibold mb-3">
            Title
          </Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Brief summary of your issue or feedback"
            placeholderTextColor="#708090"
            className="bg-[#2B42B6] rounded-2xl p-4 text-[#F1F5F9] text-base border border-[#274B8E]"
            style={{ shadowColor: '#274B8E', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}
          />
        </View>

        <View className="mb-8">
          <Text className="text-[#E6FAFF] text-lg font-semibold mb-3">
            Description
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder={getPromptText(selectedKind)}
            placeholderTextColor="#708090"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            className="bg-[#2B42B6] rounded-2xl p-4 text-[#F1F5F9] text-base border border-[#274B8E]"
            style={{ shadowColor: '#274B8E', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-2xl p-4 ${isSubmitting ? 'bg-[#708090]' : 'bg-[#33CFFF]'
            }`}
          style={{ shadowColor: '#33CFFF', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}
        >
          <Text className="text-center text-[#021A40] font-semibold text-lg">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
} 
import NotificationSettings from '@/components/NotificationSettings';
import OpenAIApiKeyInput from '@/components/OpenAiApiKeyInput';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import React from 'react';

export default function SettingsScreen() {
  return (
    <LinearGradient>
      <ScrollView contentContainerStyle={{ paddingTop: 32, marginHorizontal: 16 }}>
        <NotificationSettings />
        <OpenAIApiKeyInput />
      </ScrollView>
    </LinearGradient>
  );
}

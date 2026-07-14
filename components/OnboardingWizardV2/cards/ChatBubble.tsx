import React from 'react';
import { Text, View } from 'react-native';

interface ChatBubbleProps {
  role: 'user' | 'ai';
  text: string;
  testID?: string;
}

export default function ChatBubble({ role, text, testID }: ChatBubbleProps) {
  const isUser = role === 'user';
  return (
    <View
      testID={testID ?? `chat-bubble-${role}`}
      className={`mb-3 max-w-[85%] p-3 rounded-2xl ${
        isUser
          ? 'self-end bg-cyan-500'
          : 'self-start bg-slate-700 border border-cyan-400'
      }`}
    >
      <Text
        className={`text-base ${
          isUser ? 'text-[#021A40]' : 'text-[#E6FAFF]'
        }`}
      >
        {text}
      </Text>
    </View>
  );
}

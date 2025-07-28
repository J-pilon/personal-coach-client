import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';
import { AiTaskSuggestion } from '@/hooks/useAiSuggestedTasks';

interface AiTaskCardProps {
  suggestion: AiTaskSuggestion;
  onAddToToday: (suggestion: AiTaskSuggestion) => void;
  onAddForLater: (suggestion: AiTaskSuggestion) => void;
  onDismiss: (suggestion: AiTaskSuggestion) => void;
  isLoading?: boolean;
}

export function AiTaskCard({
  suggestion,
  onAddToToday,
  onAddForLater,
  onDismiss,
  isLoading = false
}: AiTaskCardProps) {
  return (
    <View className="p-4 mx-4 my-2 rounded-2xl border border-cyan-400 border-solid shadow-lg">
      {/* AI Badge */}
      <View className="absolute top-3 right-3 z-10">
        <View className="flex-row items-center px-2 py-1 rounded-xl border border-cyan-400 bg-cyan-400/10">
          <Ionicons name="bulb" size={12} color={Colors.accent.primary} />
          <Text className="ml-1 text-xs font-semibold text-cyan-400">AI</Text>
        </View>
      </View>

      {/* Task Content */}
      <View className="mb-4">
        <Text className="mb-2 text-base font-semibold text-slate-100">
          {suggestion.title}
        </Text>

        {suggestion.description && (
          <Text className="mb-3 text-sm leading-5 text-slate-200">
            {suggestion.description}
          </Text>
        )}

        <View className="flex-row items-center">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color={Colors.text.muted} />
            <Text className="ml-1 text-xs text-slate-400">
              {suggestion.time_estimate_minutes} min
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2 justify-between">
        <TouchableOpacity
          className={`flex-row flex-1 justify-center items-center px-3 py-2 rounded-lg border ${isLoading ? 'border-slate-400 bg-slate-400/10' : 'border-cyan-400 bg-cyan-400/10'
            }`}
          onPress={() => !isLoading && onAddToToday(suggestion)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.text.muted} />
          ) : (
            <Ionicons name="checkmark-circle" size={16} color={Colors.accent.primary} />
          )}
          <Text className={`ml-1 text-xs font-medium ${isLoading ? 'text-slate-400' : 'text-cyan-400'
            }`}>
            {isLoading ? 'Adding...' : 'Add to Today'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row flex-1 justify-center items-center px-3 py-2 rounded-lg border ${isLoading ? 'border-slate-400 bg-slate-400/10' : 'border-slate-400 bg-slate-400/10'
            }`}
          onPress={() => !isLoading && onAddForLater(suggestion)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.text.muted} />
          ) : (
            <Ionicons name="time" size={16} color={Colors.text.muted} />
          )}
          <Text className={`ml-1 text-xs font-medium ${isLoading ? 'text-slate-400' : 'text-slate-400'
            }`}>
            {isLoading ? 'Adding...' : 'Add for Later'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row flex-1 justify-center items-center px-3 py-2 rounded-lg border ${isLoading ? 'border-slate-400 bg-slate-400/10' : 'border-slate-400 bg-slate-400/10'
            }`}
          onPress={() => !isLoading && onDismiss(suggestion)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.text.muted} />
          ) : (
            <Ionicons name="close-circle" size={16} color={Colors.text.muted} />
          )}
          <Text className={`ml-1 text-xs font-medium ${isLoading ? 'text-slate-400' : 'text-slate-400'
            }`}>
            {isLoading ? 'Adding...' : 'Dismiss'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 
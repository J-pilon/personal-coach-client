import { reportError } from '@/utils/reportError';
import { Ionicons } from '@expo/vector-icons';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (args: { error: Error; reset: () => void }) => ReactNode;
  onReset?: () => void;
  onError?: (error: Error, info: ErrorInfo) => void;
  scope?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, { scope: this.props.scope, componentStack: info.componentStack });
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback({ error, reset: this.reset });
    }

    return <DefaultFallback error={error} reset={this.reset} />;
  }
}

function DefaultFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <View
      testID="error-boundary-fallback"
      className="flex-1 items-center justify-center p-6 bg-[#021A40]"
    >
      <View className="items-center mb-6">
        <Ionicons name="alert-circle-outline" size={56} color="#33CFFF" />
        <Text
          className="mt-4 text-2xl font-semibold text-[#F1F5F9] text-center"
          testID="error-boundary-title"
        >
          Something went wrong
        </Text>
        <Text
          className="mt-2 text-base text-[#E6FAFF] text-center"
          testID="error-boundary-message"
        >
          {error.message || 'An unexpected error occurred. Please try again.'}
        </Text>
      </View>

      <Pressable
        onPress={reset}
        className="px-6 py-3 bg-cyan-400 rounded-xl"
        testID="error-boundary-retry-button"
      >
        <Text className="text-[#021A40] font-semibold text-base">Try Again</Text>
      </Pressable>
    </View>
  );
}

export default ErrorBoundary;

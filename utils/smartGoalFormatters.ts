/**
 * SMART Goal Formatter Utilities
 * 
 * This module provides utility functions for formatting and processing SMART goals
 * to improve maintainability and testability of goal-related components.
 */

export interface SmartGoalResponse {
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
}

export interface TimeframeMapping {
  [key: string]: string;
}

export interface TimeframeOption {
  label: string;
  value: string;
  serverValue: string;
}

// Timeframe configuration - easily extensible
export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: '1 Month', value: '1 month', serverValue: '1_month' },
  { label: '3 Months', value: '3 months', serverValue: '3_months' },
  { label: '6 Months', value: '6 months', serverValue: '6_months' },
];

// Timeframe mapper for AI response parsing
export const TIMEFRAME_MAPPER: TimeframeMapping = {
  '1 month': 'one_month',
  '3 months': 'three_month',
  '6 months': 'six_month'
};

/**
 * Formats timeframe for AI response parsing
 * @param selectedTimeframe - The user-selected timeframe
 * @param aiResponse - The AI response object
 * @returns Formatted SMART goal response
 */
export const formatTimeframeForAiResponse = (
  selectedTimeframe: string,
  aiResponse: any
): SmartGoalResponse => {
  if (!aiResponse?.response) {
    throw new Error('No AI response available');
  }

  const timeframeKey = TIMEFRAME_MAPPER[selectedTimeframe];
  if (!timeframeKey) {
    throw new Error(`Invalid timeframe: ${selectedTimeframe}`);
  }

  const response = aiResponse.response[timeframeKey];
  if (!response) {
    throw new Error(`No response found for timeframe: ${timeframeKey}`);
  }

  return response;
};

/**
 * Converts user-friendly timeframe to server format
 * @param userTimeframe - The user-selected timeframe
 * @returns Server-compatible timeframe value
 */
export const getServerTimeframe = (userTimeframe: string): '1 month' | '3 months' | '6 months' => {
  const option = TIMEFRAME_OPTIONS.find(opt => opt.value === userTimeframe);
  if (!option) {
    throw new Error(`Invalid timeframe: ${userTimeframe}`);
  }
  return option.serverValue as '1_month' | '3_months' | '6_months';
};

/**
 * Validates goal creation data
 * @param goalDescription - The goal description
 * @param selectedTimeframe - The selected timeframe
 * @returns Validation result with error message if invalid
 */
export const validateGoalData = (
  goalDescription: string,
  selectedTimeframe: string
): { isValid: boolean; errorMessage?: string } => {
  if (!goalDescription.trim()) {
    return { isValid: false, errorMessage: 'Please enter a goal description' };
  }

  if (!selectedTimeframe) {
    return { isValid: false, errorMessage: 'Please select a timeframe' };
  }

  if (!TIMEFRAME_OPTIONS.find(opt => opt.value === selectedTimeframe)) {
    return { isValid: false, errorMessage: 'Invalid timeframe selected' };
  }

  return { isValid: true };
};

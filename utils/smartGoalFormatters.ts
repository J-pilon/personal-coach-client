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
  serverValue: '1_month' | '3_months' | '6_months';
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
export const getServerTimeframe = (userTimeframe: string): '1_month' | '3_months' | '6_months' => {
  const option = TIMEFRAME_OPTIONS.find(opt => opt.value === userTimeframe);
  if (!option) {
    throw new Error(`Invalid timeframe: ${userTimeframe}`);
  }
  return option.serverValue;
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

// ---------------------------------------------------------------------------
// Due-status badge logic
// ---------------------------------------------------------------------------

const MS_PER_DAY = 86_400_000;

export type GoalDueVariant = 'neutral' | 'warning' | 'danger';
export type GoalDueKind = 'date' | 'due_soon' | 'due_today' | 'due_yesterday' | 'past_due' | 'none';

export interface GoalDueStatus {
  label: string;
  variant: GoalDueVariant;
  kind: GoalDueKind;
}

const NONE_STATUS: GoalDueStatus = { label: '', variant: 'neutral', kind: 'none' };

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Parses a YYYY-MM-DD date string as a local-time date, avoiding the
 * UTC-midnight shift that `new Date('YYYY-MM-DD')` produces in most timezones.
 */
function parseLocalDate(dateStr: string): Date | null {
  const parts = dateStr.split('T')[0].split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Returns the due-status label and styling variant for a goal card/badge.
 *
 * Day-diff rules (targetStart - todayStart in whole days):
 *   > 30            → formatted date (neutral)
 *   1 – 30          → "X day(s) until due" (warning)
 *   0               → "Due today" (warning)
 *   -1, !completed  → "Due yesterday" (danger)
 *   ≤ -2, !completed → "X day(s) past due" (danger)
 *   past + completed → none (hide badge)
 *   missing/invalid  → none
 */
export function getGoalDueStatus(
  targetDate: string | undefined,
  completed: boolean,
  now: Date = new Date()
): GoalDueStatus {
  if (!targetDate) return NONE_STATUS;

  const target = parseLocalDate(targetDate);
  if (!target) return NONE_STATUS;

  const todayStart = startOfDay(now);
  const targetStart = startOfDay(target);
  const dayDiff = Math.floor((targetStart.getTime() - todayStart.getTime()) / MS_PER_DAY);

  if (dayDiff > 30) {
    return { label: formatDisplayDate(target), variant: 'neutral', kind: 'date' };
  }

  if (dayDiff >= 1) {
    const days = dayDiff;
    return {
      label: `${days} ${days === 1 ? 'day' : 'days'} until due`,
      variant: 'warning',
      kind: 'due_soon',
    };
  }

  if (dayDiff === 0) {
    return { label: 'Due today', variant: 'warning', kind: 'due_today' };
  }

  if (completed) return NONE_STATUS;

  if (dayDiff === -1) {
    return { label: 'Due yesterday', variant: 'danger', kind: 'due_yesterday' };
  }

  const absDays = Math.abs(dayDiff);
  return {
    label: `${absDays} ${absDays === 1 ? 'day' : 'days'} past due`,
    variant: 'danger',
    kind: 'past_due',
  };
}

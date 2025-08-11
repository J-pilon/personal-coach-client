// API client for Rails server AI endpoints
import { apiPost, type ApiResponse } from '../utils/apiRequest';

// AI response interfaces
export interface AiResponse {
  intent: 'smart_goal' | 'single_smart_goal' | 'prioritization' | 'error';
  response: any; // This can be different based on intent
  context_used: boolean;
  request_id: number;
}

// Smart goal response interface
export interface SmartGoalResponse {
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  time_bound?: string;
}

// Prioritization response interface
export interface PrioritizationItem {
  task: string;
  priority: number;
  rationale?: string;
  recommended_action?: string;
}

export interface PrioritizationResponse extends Array<PrioritizationItem> {}

export interface MultiPeriodSmartGoalResponse {
  one_month: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    time_bound: string;
  };
  three_months: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    time_bound: string;
  };
  six_months: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    time_bound: string;
  };
}

// Error response interface
export interface ErrorResponse {
  error: string;
}

// AI request parameters
export interface AiRequestParams {
  input: string;
  timeframe?: string;
  intent: string;
  user_provided_key?: string | null;
}

// AI API class
export class AIAPI {
  async processAiRequest(params: AiRequestParams): Promise<ApiResponse<AiResponse>> {
    return apiPost<AiResponse>('/ai/proxy', params);
  }

  async createSmartGoal(input: string): Promise<ApiResponse<AiResponse>> {
    return apiPost<AiResponse>('/ai/proxy', { input });
  }

  async prioritizeTasks(input: string): Promise<ApiResponse<AiResponse>> {
    return apiPost<AiResponse>('/ai/proxy', { input });
  }

  // Type guards for response validation
  isSmartGoalResponse(response: AiResponse): response is AiResponse & { response: SmartGoalResponse } {
    return response.intent === 'smart_goal';
  }

  isSingleSmartGoalResponse(response: AiResponse): response is AiResponse & { response: SmartGoalResponse } {
    return response.intent === 'single_smart_goal';
  }

  isPrioritizationResponse(response: AiResponse): response is AiResponse & { response: PrioritizationResponse } {
    return response.intent === 'prioritization';
  }

  isErrorResponse(response: AiResponse): response is AiResponse & { response: ErrorResponse } {
    return response.intent === 'error';
  }

  // Helper methods for formatting responses
  formatSingleGoal(goal: any, period: string): Record<string, Record<string, string>> {
    return {
      [period]: {
        specific: goal.specific || '',
        measurable: goal.measurable || '',
        achievable: goal.achievable || '',
        relevant: goal.relevant || '',
        time_bound: goal.time_bound || '',
      },
    };
  }

  formatMultiPeriodSmartGoalResponse(response: MultiPeriodSmartGoalResponse): Record<string, Record<string, string>> {
    return {
      "1 Month Goal": response.one_month,
      "3 Month Goal": response.three_months,
      "6 Month Goal": response.six_months,
    };
  }

  formatPrioritizationResponse(response: PrioritizationResponse): string {
    return response
      .map((item, index) => `${index + 1}. ${item.task} (Priority: ${item.priority})`)
      .join('\n');
  }
} 
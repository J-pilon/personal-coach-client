// API client for Rails server AI endpoints
// Base URL for the Rails server API
const API_BASE_URL = 'http://localhost:3000/api/v1';

// AI response interfaces
export interface AiResponse {
  intent: 'smart_goal' | 'prioritization' | 'error';
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
}

// API response wrapper
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Import the auth headers function
    const { getAuthHeaders } = await import('../utils/api');
    const headers = await getAuthHeaders();
    
    const response = await fetch(url, {
      headers: {
        ...headers,
        ...options.headers,
      },
      ...options,
    });

    // Check if response has content and is JSON
    const contentType = response.headers.get('content-type');
    const hasContent = contentType && contentType.includes('application/json');
    
    let data: any = undefined;
    
    if (hasContent) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.log("**** JSON PARSE ERROR: ", parseError);
        return {
          error: 'Invalid JSON response from server',
          status: response.status,
        };
      }
    }

    if (!response.ok) {
      return {
        error: data?.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

// Standalone helper function for formatting single goals
export const formatSingleGoal = (goal: any, period: string): Record<string, Record<string, string>> => {
  return {
    [period]: {
      'Specific': goal.specific || '',
      'Measurable': goal.measurable || '',
      'Achievable': goal.achievable || '',
      'Relevant': goal.relevant || '',
      'Time-bound': goal.time_bound || ''
    }
  };
};

// AI API functions
export const aiApi = {
  // Process AI request
  async processAiRequest(params: AiRequestParams): Promise<ApiResponse<AiResponse>> {
    return apiRequest<AiResponse>('/ai', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Helper function to process smart goal request
  async createSmartGoal(input: string): Promise<ApiResponse<AiResponse>> {
    return this.processAiRequest({ input });
  },

  // Helper function to process prioritization request
  async prioritizeTasks(input: string): Promise<ApiResponse<AiResponse>> {
    return this.processAiRequest({ input });
  },

  // Helper function to check if response is a smart goal
  isSmartGoalResponse(response: AiResponse): response is AiResponse & { response: SmartGoalResponse } {
    return response.intent === 'smart_goal';
  },

  // Helper function to check if response is prioritization
  isPrioritizationResponse(response: AiResponse): response is AiResponse & { response: PrioritizationResponse } {
    return response.intent === 'prioritization';
  },

  // Helper function to check if response is an error
  isErrorResponse(response: AiResponse): response is AiResponse & { response: ErrorResponse } {
    return response.intent === 'error';
  },

  formatSingleGoal(goal: any, period: string): Record<string, Record<string, string>> {
    return {
      [period]: {
        'Specific': goal.specific || '',
        'Measurable': goal.measurable || '',
        'Achievable': goal.achievable || '',
        'Relevant': goal.relevant || '',
        'Time-bound': goal.time_bound || ''
      }
    };
  },

  // Helper function to format multi-period SMART goal response
  formatMultiPeriodSmartGoalResponse(response: MultiPeriodSmartGoalResponse): Record<string, Record<string, string>> {
    return {
      ...formatSingleGoal(response.one_month, '1 Month Goal'),
      ...formatSingleGoal(response.three_months, '3 Month Goal'),
      ...formatSingleGoal(response.six_months, '6 Month Goal')
    };
  },

  // Helper function to format prioritization response
  formatPrioritizationResponse(response: PrioritizationResponse): string {
    return response
      .sort((a, b) => a.priority - b.priority)
      .map((item, index) => `${index + 1}. ${item.task} (Priority: ${item.priority})${item.rationale ? ` - ${item.rationale}` : ''}`)
      .join('\n');
  },
}; 
import { AIAPI, type AiResponse } from '../api/ai';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the getAuthHeaders function
jest.mock('../utils/api', () => ({
  getAuthHeaders: jest.fn().mockResolvedValue({
    'Content-Type': 'application/json'
  })
}));

describe('AI API', () => {
  let aiApi: AIAPI;

  beforeEach(() => {
    aiApi = new AIAPI();
    jest.clearAllMocks();
  });

  describe('processAiRequest', () => {
    it('should process AI request successfully', async () => {
      const mockResponse = {
        intent: 'smart_goal',
        response: {
          specific: 'Exercise for 30 minutes daily',
          measurable: 'Track workouts in fitness app',
          achievable: 'Start with 3 days per week',
          relevant: 'Improves overall health and energy',
          time_bound: 'Complete 30 workouts in 3 months'
        },
        context_used: true,
        request_id: 123
      };

      const mockFetchResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        },
        json: async () => mockResponse
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await aiApi.processAiRequest({ input: 'Create a goal to exercise more' });

      expect(result.data).toEqual(mockResponse);
      expect(result.status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/ai/proxy',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ input: 'Create a goal to exercise more' })
        })
      );
    });

    it('should handle API errors', async () => {
      const mockError = { error: 'Input is required' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        },
        json: async () => mockError
      });

      const result = await aiApi.processAiRequest({ input: '' });

      expect(result.error).toBe('Input is required');
      expect(result.status).toBe(400);
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await aiApi.processAiRequest({ input: 'test' });

      expect(result.error).toBe('Network error');
      expect(result.status).toBe(0);
    });
  });

  describe('createSmartGoal', () => {
    it('should create smart goal successfully', async () => {
      const mockResponse = {
        intent: 'smart_goal',
        response: {
          specific: 'Learn Spanish basics',
          measurable: 'Complete 10 lessons',
          achievable: 'Study 30 minutes daily',
          relevant: 'Career advancement',
          time_bound: '3 months'
        },
        context_used: false,
        request_id: 456
      };

      const mockFetchResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        },
        json: async () => mockResponse
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await aiApi.createSmartGoal('Learn Spanish');

      expect(result.data).toEqual(mockResponse);
      expect(result.status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/ai/proxy',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ input: 'Learn Spanish' })
        })
      );
    });
  });

  describe('prioritizeTasks', () => {
    it('should prioritize tasks successfully', async () => {
      const mockResponse = {
        intent: 'prioritization',
        response: [
          { task: 'exercise', priority: 1, rationale: 'High impact' },
          { task: 'work', priority: 2, rationale: 'Important' }
        ],
        context_used: true,
        request_id: 789
      };

      const mockFetchResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        },
        json: async () => mockResponse
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await aiApi.prioritizeTasks('Prioritize my tasks');

      expect(result.data).toEqual(mockResponse);
      expect(result.status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/ai/proxy',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ input: 'Prioritize my tasks' })
        })
      );
    });
  });

  describe('response type guards', () => {
    it('should correctly identify smart goal responses', () => {
      const smartGoalResponse: AiResponse = {
        intent: 'smart_goal',
        response: {
          specific: 'Exercise for 30 minutes daily',
          measurable: 'Track workouts in fitness app',
          achievable: 'Start with 3 days per week',
          relevant: 'Improves overall health and energy',
          time_bound: 'Complete 30 workouts in 3 months'
        },
        context_used: true,
        request_id: 123
      };

      expect(aiApi.isSmartGoalResponse(smartGoalResponse)).toBe(true);
      expect(aiApi.isPrioritizationResponse(smartGoalResponse)).toBe(false);
      expect(aiApi.isErrorResponse(smartGoalResponse)).toBe(false);
    });

    it('should correctly identify prioritization responses', () => {
      const prioritizationResponse: AiResponse = {
        intent: 'prioritization',
        response: [
          { task: 'exercise', priority: 1, rationale: 'High impact' },
          { task: 'work', priority: 2, rationale: 'Important' }
        ],
        context_used: true,
        request_id: 789
      };

      expect(aiApi.isSmartGoalResponse(prioritizationResponse)).toBe(false);
      expect(aiApi.isPrioritizationResponse(prioritizationResponse)).toBe(true);
      expect(aiApi.isErrorResponse(prioritizationResponse)).toBe(false);
    });

    it('should correctly identify error responses', () => {
      const errorResponse: AiResponse = {
        intent: 'error',
        response: { error: 'Invalid input' },
        context_used: false,
        request_id: 999
      };

      expect(aiApi.isSmartGoalResponse(errorResponse)).toBe(false);
      expect(aiApi.isPrioritizationResponse(errorResponse)).toBe(false);
      expect(aiApi.isErrorResponse(errorResponse)).toBe(true);
    });
  });

  describe('response formatting', () => {
    it('should format smart goal response correctly', () => {
      const smartGoalResponse = {
        specific: 'Exercise for 30 minutes daily',
        measurable: 'Track workouts in fitness app',
        achievable: 'Start with 3 days per week',
        relevant: 'Improves overall health and energy',
        time_bound: 'Complete 30 workouts in 3 months'
      };

      const formatted = aiApi.formatSingleGoal(smartGoalResponse, 'Test Goal');
      expect(formatted['Test Goal']['specific']).toBe('Exercise for 30 minutes daily');
      expect(formatted['Test Goal']['measurable']).toBe('Track workouts in fitness app');
      expect(formatted['Test Goal']['achievable']).toBe('Start with 3 days per week');
      expect(formatted['Test Goal']['relevant']).toBe('Improves overall health and energy');
      expect(formatted['Test Goal']['time_bound']).toBe('Complete 30 workouts in 3 months');
    });

    it('should format prioritization response correctly', () => {
      const prioritizationResponse = [
        { task: 'exercise', priority: 1, rationale: 'High impact' },
        { task: 'work', priority: 2, rationale: 'Important' }
      ];

      const formatted = aiApi.formatPrioritizationResponse(prioritizationResponse);
      expect(formatted).toContain('1. exercise (Priority: 1)');
      expect(formatted).toContain('2. work (Priority: 2)');
    });
  });
}); 
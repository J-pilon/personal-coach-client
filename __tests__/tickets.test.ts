import { createTicket, getTicket } from '@/api/tickets';

// Mock the apiRequest function
jest.mock('@/utils/apiRequest', () => ({
  apiRequest: jest.fn()
}));

const mockApiRequest = require('@/utils/apiRequest').apiRequest;

describe('Tickets API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a ticket with correct payload', async () => {
      const mockResponse = {
        id: 1,
        kind: 'bug',
        title: 'Test Bug',
        description: 'Test Description',
        source: 'app',
        metadata: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const ticketData = {
        kind: 'bug' as const,
        title: 'Test Bug',
        description: 'Test Description',
        source: 'app' as const
      };

      const diagnostics = {
        app_version: '1.0.0',
        device_model: 'iPhone 14'
      };

      const result = await createTicket(ticketData, diagnostics);

      expect(mockApiRequest).toHaveBeenCalledWith('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          ticket: ticketData,
          ...diagnostics
        })
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTicket', () => {
    it('should get a ticket by id', async () => {
      const mockResponse = {
        id: 1,
        kind: 'bug',
        title: 'Test Bug',
        description: 'Test Description',
        source: 'app',
        metadata: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await getTicket(1);

      expect(mockApiRequest).toHaveBeenCalledWith('/tickets/1', {
        method: 'GET'
      });

      expect(result).toEqual(mockResponse);
    });
  });
}); 
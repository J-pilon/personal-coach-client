import { DeviceTokensAPI, type DeviceTokenData } from '../../api/deviceTokens';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the getAuthHeaders function
jest.mock('../../utils/api', () => ({
  getAuthHeaders: jest.fn().mockResolvedValue({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token'
  })
}));

describe('DeviceTokensAPI', () => {
  let api: DeviceTokensAPI;

  beforeEach(() => {
    api = new DeviceTokensAPI();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register device token successfully', async () => {
      const mockResponse = {
        message: 'Device token registered successfully',
        device_token: {
          id: 1,
          platform: 'ios',
          active: true
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        },
        json: async () => mockResponse
      });

      const tokenData: DeviceTokenData = {
        token: 'ExponentPushToken[abc123]',
        platform: 'ios',
        device_name: 'iPhone 14',
        app_version: '1.0.0'
      };

      const result = await api.register(tokenData);

      expect(result.data).toEqual(mockResponse);
      expect(result.status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/device_tokens',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ device_token: tokenData })
        })
      );
    });

    it('should handle registration errors', async () => {
      const mockError = { error: 'Token already registered' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        },
        json: async () => mockError
      });

      const tokenData: DeviceTokenData = {
        token: 'ExponentPushToken[abc123]',
        platform: 'ios'
      };

      const result = await api.register(tokenData);

      expect(result.error).toBe('Token already registered');
      expect(result.status).toBe(422);
    });
  });

  describe('unregister', () => {
    it('should unregister device token successfully', async () => {
      const mockResponse = { message: 'Device token unregistered successfully' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        },
        json: async () => mockResponse
      });

      const result = await api.unregister('ExponentPushToken[abc123]');

      expect(result.data).toEqual(mockResponse);
      expect(result.status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/device_tokens/ExponentPushToken%5Babc123%5D',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should handle unregister errors', async () => {
      const mockError = { error: 'Token not found' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        },
        json: async () => mockError
      });

      const result = await api.unregister('invalid-token');

      expect(result.error).toBe('Token not found');
      expect(result.status).toBe(404);
    });
  });
});


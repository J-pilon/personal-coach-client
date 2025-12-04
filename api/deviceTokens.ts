import { apiDelete, apiPost, type ApiResponse } from '../utils/apiRequest';

interface DeviceToken {
  id: number;
  platform: string;
  active: boolean;
}

interface RegisterDeviceTokenResponse {
  message: string;
  device_token: DeviceToken;
  errors?: string[]; 
}

export interface DeviceTokenData {
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_name?: string;
  app_version?: string;
}

export class DeviceTokensAPI {
  async register(data: DeviceTokenData): Promise<ApiResponse<RegisterDeviceTokenResponse>> {
    return apiPost<RegisterDeviceTokenResponse>('/device_tokens', { device_token: data })
  }
  
  async unregister(token: string): Promise<ApiResponse<{ message: string }>> {
    return apiDelete<{ message: string }>(`/device_tokens/${encodeURIComponent(token)}`)
  }
}

export const deviceTokensAPI = new DeviceTokensAPI();

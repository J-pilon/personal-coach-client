import { apiGet, apiPatch, type ApiResponse } from '../utils/apiRequest';

export interface NotificationPreference {
  push_enabled: boolean;
  preferred_time: string; // Time string like "09:00:00"
}

export interface NotificationPreferenceResponse {
  notification_preference: NotificationPreference;
}

export interface UpdateNotificationPreferenceData {
  push_enabled?: boolean;
  preferred_time?: string;
}

export class NotificationPreferencesAPI {
  async get(): Promise<ApiResponse<NotificationPreferenceResponse>> {
    return apiGet<NotificationPreferenceResponse>('/notification_preferences');
  }

  async update(
    data: UpdateNotificationPreferenceData
  ): Promise<ApiResponse<NotificationPreferenceResponse>> {
    return apiPatch<NotificationPreferenceResponse>('/notification_preferences', {
      notification_preference: data,
    });
  }
}

export const notificationPreferencesAPI = new NotificationPreferencesAPI();


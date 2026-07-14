import type {
  NotificationScheduleModel,
  UpsertNotificationScheduleParams,
} from '../models/notificationSchedule';
import { apiPost, type ApiResponse } from '../utils/apiRequest';

export class NotificationSchedulesAPI {
  async upsert(
    params: UpsertNotificationScheduleParams,
  ): Promise<ApiResponse<NotificationScheduleModel>> {
    return apiPost<NotificationScheduleModel>('/notification_schedules', {
      notification_schedule: params,
    });
  }
}

export const notificationSchedulesApi = new NotificationSchedulesAPI();

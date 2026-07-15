import { NotificationSchedulesAPI } from '../../api/notificationSchedules';

global.fetch = jest.fn();

jest.mock('../../utils/api', () => ({
  getAuthHeaders: jest.fn().mockResolvedValue({
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-token',
  }),
}));

describe('NotificationSchedulesAPI', () => {
  it('POSTs upsert with notification_schedule payload', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: jest.fn().mockReturnValue('application/json') },
      json: async () => ({ id: 9, active: true }),
    });

    const api = new NotificationSchedulesAPI();
    await api.upsert({
      kind: 'daily_check_in',
      local_time: '07:00:00',
      timezone: 'America/New_York',
      active: true,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/notification_schedules'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          notification_schedule: {
            kind: 'daily_check_in',
            local_time: '07:00:00',
            timezone: 'America/New_York',
            active: true,
          },
        }),
      }),
    );
  });
});

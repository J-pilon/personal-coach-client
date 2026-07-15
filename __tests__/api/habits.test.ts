import { HabitsAPI } from '../../api/habits';
import type { CreateHabitParams } from '../../models/habit';

global.fetch = jest.fn();

jest.mock('../../utils/api', () => ({
  getAuthHeaders: jest.fn().mockResolvedValue({
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-token',
  }),
}));

const okResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  headers: { get: jest.fn().mockReturnValue('application/json') },
  json: async () => body,
});

describe('HabitsAPI', () => {
  let api: HabitsAPI;
  beforeEach(() => {
    api = new HabitsAPI();
    jest.clearAllMocks();
  });

  it('POSTs bulk habits to /habits with smart_goal_id', async () => {
    const habits: CreateHabitParams[] = [
      {
        title: 'Meditate',
        frequency: 'daily',
        cue: 'After coffee',
        minimum_version: '1 min',
        normal_version: '10 min',
        position: 1,
      },
    ];
    (fetch as jest.Mock).mockResolvedValueOnce(okResponse([{ id: 1 }]));

    const res = await api.createBulk(42, habits);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/habits'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ smart_goal_id: 42, habits }),
      }),
    );
    expect(res.data).toEqual([{ id: 1 }]);
  });
});

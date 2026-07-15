import { HabitCompletionsAPI } from '../../api/habitCompletions';

global.fetch = jest.fn();

jest.mock('../../utils/api', () => ({
  getAuthHeaders: jest.fn().mockResolvedValue({
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-token',
  }),
}));

describe('HabitCompletionsAPI', () => {
  it('POSTs a committed completion under habit_completion key', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: { get: jest.fn().mockReturnValue('application/json') },
      json: async () => ({ id: 7, habit_id: 3, state: 'committed' }),
    });

    const api = new HabitCompletionsAPI();
    const res = await api.create({ habit_id: 3, state: 'committed' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/habit_completions'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          habit_completion: { habit_id: 3, state: 'committed' },
        }),
      }),
    );
    expect(res.data?.state).toBe('committed');
  });
});

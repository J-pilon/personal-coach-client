import { OnboardingAPI } from '../../api/onboarding';

global.fetch = jest.fn();

jest.mock('../../utils/api', () => ({
  getAuthHeaders: jest.fn().mockResolvedValue({
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-token',
  }),
}));

const ok = (body: unknown) => ({
  ok: true,
  status: 200,
  headers: { get: jest.fn().mockReturnValue('application/json') },
  json: async () => body,
});

describe('OnboardingAPI', () => {
  let api: OnboardingAPI;
  beforeEach(() => {
    api = new OnboardingAPI();
    jest.clearAllMocks();
  });

  it('GETs resume state', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(ok({ current_step: 2 }));
    const res = await api.resume();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/onboarding/resume'),
      expect.objectContaining({ method: 'GET' }),
    );
    expect(res.data?.current_step).toBe(2);
  });

  it('POSTs to start a discovery session', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      ok({ session_id: 1, ai_request_id: 1, job_id: 'j1', status: 'queued' }),
    );
    const res = await api.startDiscovery();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/onboarding/discovery/sessions'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(res.data?.job_id).toBe('j1');
  });

  it('POSTs a discovery message with session_id + text', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      ok({
        session_id: 1,
        ai_request_id: 2,
        job_id: 'j2',
        status: 'queued',
        force_draft: false,
        turn_count: 2,
      }),
    );
    await api.postDiscoveryMessage(1, 'hello');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/onboarding/discovery/messages'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ session_id: 1, text: 'hello' }),
      }),
    );
  });

  it('POSTs habit suggestions with position/exclude', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      ok({ ai_request_id: 3, job_id: 'j3', status: 'queued' }),
    );
    await api.suggestHabits({ smart_goal_id: 5, position: 2, exclude: ['x'] });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/onboarding/habits/suggest'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          smart_goal_id: 5,
          position: 2,
          exclude: ['x'],
        }),
      }),
    );
  });
});

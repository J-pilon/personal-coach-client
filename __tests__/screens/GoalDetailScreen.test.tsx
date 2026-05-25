import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import GoalDetailScreen from '../../app/smartGoals/[id]';

jest.mock('../../hooks/useSmartGoals', () => ({
  useSmartGoal: jest.fn(),
  useUpdateSmartGoal: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '42' }),
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../components/ToastManager', () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const mockUseSmartGoal = require('../../hooks/useSmartGoals').useSmartGoal;
const mockUseUpdateSmartGoal = require('../../hooks/useSmartGoals').useUpdateSmartGoal;

const mockMutate = jest.fn();
const defaultMutation = { mutate: mockMutate, isPending: false };

const baseGoal = {
  id: 42,
  title: 'Learn TypeScript',
  description: 'Deep dive into TS',
  timeframe: '3_months',
  specific: 'Complete TS course',
  measurable: 'Pass final assessment',
  achievable: 'Study 1h daily',
  relevant: 'Career growth',
  time_bound: 'Within 3 months',
  completed: false,
  target_date: '2026-06-01',
  profile_id: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  tasks: { open: [], completed: [] },
};

function renderScreen(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <GoalDetailScreen />
    </QueryClientProvider>
  );
}

describe('GoalDetailScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
    mockUseUpdateSmartGoal.mockReturnValue(defaultMutation);
  });

  it('renders loading state', () => {
    mockUseSmartGoal.mockReturnValue({ data: undefined, isLoading: true, error: null });

    renderScreen(queryClient);

    expect(screen.getByTestId('goal-detail-loading')).toBeTruthy();
  });

  it('renders error state', () => {
    mockUseSmartGoal.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    renderScreen(queryClient);

    expect(screen.getByTestId('goal-detail-error-title')).toBeTruthy();
    expect(screen.getByTestId('goal-detail-error-message')).toBeTruthy();
  });

  it('renders goal title, SMART breakdown, and status pill', () => {
    mockUseSmartGoal.mockReturnValue({ data: baseGoal, isLoading: false, error: null });

    renderScreen(queryClient);

    expect(screen.getByTestId('goal-detail-title')).toBeTruthy();
    expect(screen.getByText('Learn TypeScript')).toBeTruthy();
    expect(screen.getByTestId('goal-detail-status')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByTestId('goal-detail-specific')).toBeTruthy();
  });

  it('renders "Mark as Complete" button for in-progress goal', () => {
    mockUseSmartGoal.mockReturnValue({ data: baseGoal, isLoading: false, error: null });

    renderScreen(queryClient);

    expect(screen.getByTestId('goal-detail-complete-button-text')).toBeTruthy();
    expect(screen.getByText('Mark as Complete')).toBeTruthy();
  });

  it('renders "Reopen Goal" button for completed goal', () => {
    const completedGoal = { ...baseGoal, completed: true };
    mockUseSmartGoal.mockReturnValue({ data: completedGoal, isLoading: false, error: null });

    renderScreen(queryClient);

    expect(screen.getByText('Reopen Goal')).toBeTruthy();
    expect(screen.getByText('Complete')).toBeTruthy();
  });

  it('shows Alert.alert confirmation when "Mark as Complete" is pressed', () => {
    mockUseSmartGoal.mockReturnValue({ data: baseGoal, isLoading: false, error: null });

    renderScreen(queryClient);

    fireEvent.press(screen.getByTestId('goal-detail-complete-button'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Mark Goal Complete',
      'Mark this goal as complete?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Complete' }),
      ])
    );
  });

  it('shows Alert.alert confirmation when "Reopen Goal" is pressed', () => {
    const completedGoal = { ...baseGoal, completed: true };
    mockUseSmartGoal.mockReturnValue({ data: completedGoal, isLoading: false, error: null });

    renderScreen(queryClient);

    fireEvent.press(screen.getByTestId('goal-detail-complete-button'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Reopen Goal',
      'Set this goal back to In Progress?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Reopen' }),
      ])
    );
  });

  it('calls mutation with completed: true when confirmation is confirmed', () => {
    mockUseSmartGoal.mockReturnValue({ data: baseGoal, isLoading: false, error: null });
    (Alert.alert as jest.Mock).mockImplementationOnce((_title, _msg, buttons) => {
      const confirmButton = buttons.find((b: any) => b.text === 'Complete');
      confirmButton?.onPress?.();
    });

    renderScreen(queryClient);

    fireEvent.press(screen.getByTestId('goal-detail-complete-button'));

    expect(mockMutate).toHaveBeenCalledWith(
      { id: 42, data: { completed: true } },
      expect.any(Object)
    );
  });

  it('calls mutation with completed: false when reopen is confirmed', () => {
    const completedGoal = { ...baseGoal, completed: true };
    mockUseSmartGoal.mockReturnValue({ data: completedGoal, isLoading: false, error: null });
    (Alert.alert as jest.Mock).mockImplementationOnce((_title, _msg, buttons) => {
      const confirmButton = buttons.find((b: any) => b.text === 'Reopen');
      confirmButton?.onPress?.();
    });

    renderScreen(queryClient);

    fireEvent.press(screen.getByTestId('goal-detail-complete-button'));

    expect(mockMutate).toHaveBeenCalledWith(
      { id: 42, data: { completed: false } },
      expect.any(Object)
    );
  });

  describe('due badge on detail screen', () => {
    beforeEach(() => {
      jest.useFakeTimers({ now: new Date('2026-05-25T12:00:00') });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('shows "Due today" badge when target_date is today', () => {
      const goal = { ...baseGoal, target_date: '2026-05-25', completed: false };
      mockUseSmartGoal.mockReturnValue({ data: goal, isLoading: false, error: null });

      renderScreen(queryClient);

      expect(screen.getByTestId('goal-detail-due-badge')).toBeTruthy();
      expect(screen.getByText('Due today')).toBeTruthy();
    });

    it('shows "Due yesterday" badge when target_date was yesterday and goal is incomplete', () => {
      const goal = { ...baseGoal, target_date: '2026-05-24', completed: false };
      mockUseSmartGoal.mockReturnValue({ data: goal, isLoading: false, error: null });

      renderScreen(queryClient);

      expect(screen.getByText('Due yesterday')).toBeTruthy();
    });

    it('shows "5 days until due" badge for target 5 days away', () => {
      const goal = { ...baseGoal, target_date: '2026-05-30', completed: false };
      mockUseSmartGoal.mockReturnValue({ data: goal, isLoading: false, error: null });

      renderScreen(queryClient);

      expect(screen.getByText('5 days until due')).toBeTruthy();
    });

    it('shows "3 days past due" badge for target 3 days ago and incomplete', () => {
      const goal = { ...baseGoal, target_date: '2026-05-22', completed: false };
      mockUseSmartGoal.mockReturnValue({ data: goal, isLoading: false, error: null });

      renderScreen(queryClient);

      expect(screen.getByText('3 days past due')).toBeTruthy();
    });

    it('hides due badge when goal is completed and target date is past', () => {
      const goal = { ...baseGoal, target_date: '2026-05-20', completed: true };
      mockUseSmartGoal.mockReturnValue({ data: goal, isLoading: false, error: null });

      renderScreen(queryClient);

      expect(screen.queryByTestId('goal-detail-due-badge')).toBeNull();
    });

    it('shows neutral date badge when target is more than 30 days away', () => {
      const goal = { ...baseGoal, target_date: '2026-07-01', completed: false };
      mockUseSmartGoal.mockReturnValue({ data: goal, isLoading: false, error: null });

      renderScreen(queryClient);

      expect(screen.getByTestId('goal-detail-due-badge')).toBeTruthy();
    });
  });

  it('navigates to add task screen when "Add Task" button is pressed', () => {
    mockUseSmartGoal.mockReturnValue({ data: baseGoal, isLoading: false, error: null });
    const mockPush = require('expo-router').router.push;

    renderScreen(queryClient);

    fireEvent.press(screen.getByTestId('goal-detail-add-task-button'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/addTask' })
    );
  });

  it('renders tasks list when goal has tasks', () => {
    const goalWithTasks = {
      ...baseGoal,
      tasks: {
        open: [{ id: 1, title: 'Task One', description: null }],
        completed: [{ id: 2, title: 'Task Two', description: null }],
      },
    };
    mockUseSmartGoal.mockReturnValue({ data: goalWithTasks, isLoading: false, error: null });

    renderScreen(queryClient);

    expect(screen.getByTestId('goal-detail-task-1')).toBeTruthy();
    expect(screen.getByTestId('goal-detail-completed-heading')).toBeTruthy();
  });
});

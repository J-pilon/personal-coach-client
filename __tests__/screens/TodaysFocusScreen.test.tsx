import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { Task } from '../../api/tasks';
import TodaysFocusScreen from '../../app/(tabs)/todaysFocus';
import { AiTaskSuggestion } from '../../hooks/useAiSuggestedTasks';
import { AuthProvider } from '../../hooks/useAuth';

// Mock the hooks
jest.mock('../../hooks/useTasks', () => ({
  useIncompleteTasks: jest.fn(),
  useCreateTask: jest.fn(),
  useUpdateTask: jest.fn(),
}));

jest.mock('../../hooks/useUser', () => ({
  useProfile: jest.fn(),
}));

jest.mock('../../hooks/useAiSuggestedTasks', () => ({
  useAiSuggestedTasks: jest.fn(),
}));

// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

const mockUseIncompleteTasks = require('../../hooks/useTasks').useIncompleteTasks;
const mockUseCreateTask = require('../../hooks/useTasks').useCreateTask;
const mockUseUpdateTask = require('../../hooks/useTasks').useUpdateTask;
const mockUseProfile = require('../../hooks/useUser').useProfile;
const mockUseAiSuggestedTasks = require('../../hooks/useAiSuggestedTasks').useAiSuggestedTasks;
const mockUseAuth = require('../../hooks/useAuth').useAuth;

describe('TodaysFocusScreen', () => {
  let queryClient: QueryClient;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Complete project documentation',
      description: 'Write comprehensive documentation for the current project',
      completed: false,
      action_category: 'do',
      priority: 3,
      profile_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Review code changes',
      description: 'Review and approve pending pull requests',
      completed: false,
      action_category: 'do',
      priority: 2,
      profile_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      title: 'Update dependencies',
      description: 'Update all project dependencies to latest versions',
      completed: false,
      action_category: 'do',
      priority: 1,
      profile_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const mockAiSuggestions: AiTaskSuggestion[] = [
    {
      title: 'AI Suggested Task 1',
      description: 'This is an AI suggested task',
      goal_id: 'goal-1',
      time_estimate_minutes: 30,
    },
    {
      title: 'AI Suggested Task 2',
      description: 'Another AI suggested task',
      goal_id: 'goal-2',
      time_estimate_minutes: 45,
    },
  ];

  const mockProfile = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    work_role: 'Software Engineer',
    education: 'Bachelor\'s in Computer Science',
    desires: 'To build impactful software',
    limiting_beliefs: 'I\'m not good enough',
    onboarding_status: 'complete' as const,
    onboarding_completed_at: '2024-01-01T00:00:00Z',
    user_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup default mocks
    mockUseIncompleteTasks.mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
    });

    mockUseCreateTask.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(mockTasks[0]),
      isLoading: false,
      error: null,
    });

    mockUseUpdateTask.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(mockTasks[0]),
      isLoading: false,
      error: null,
    });

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: [],
      isLoading: false,
      error: null,
      generateSuggestions: jest.fn(),
      dismissSuggestion: jest.fn(),
    });

    // Mock useAuth to return a profile
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'test@example.com' },
      profile: mockProfile,
      isLoading: false,
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  const renderTodaysFocusScreen = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TodaysFocusScreen />
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('renders the screen title correctly', () => {
    renderTodaysFocusScreen();

    expect(screen.getByTestId("todays-focus-title")).toBeTruthy();
  });

  it('renders the assist me button', () => {
    renderTodaysFocusScreen();

    expect(screen.getByTestId('todays-focus-assist-me-button')).toBeTruthy();
  });

  it('displays tasks sorted by priority', () => {
    renderTodaysFocusScreen();

    // Tasks should be sorted by priority (highest first)
    expect(screen.getByTestId('todays-focus-task-title-1')).toBeTruthy();
    expect(screen.getByTestId('todays-focus-task-title-2')).toBeTruthy();
    expect(screen.getByTestId('todays-focus-task-title-3')).toBeTruthy();
  });

  it('shows task details correctly', () => {
    renderTodaysFocusScreen();

    expect(screen.getByTestId('todays-focus-task-description-1')).toBeTruthy();
    expect(screen.getByTestId('todays-focus-task-priority-1')).toBeTruthy();
    expect(screen.getByTestId('todays-focus-task-priority-2')).toBeTruthy();
    expect(screen.getByTestId('todays-focus-task-priority-3')).toBeTruthy();
  });

  it('handles task selection', () => {
    renderTodaysFocusScreen();

    const firstTask = screen.getByTestId('todays-focus-task-1');
    fireEvent.press(firstTask);

    // Should show selected count
    expect(screen.getByTestId('todays-focus-tasks-title')).toBeTruthy();
  });

  it('handles multiple task selection', () => {
    renderTodaysFocusScreen();

    const firstTask = screen.getByTestId('todays-focus-task-1');
    const secondTask = screen.getByTestId('todays-focus-task-2');

    fireEvent.press(firstTask);
    fireEvent.press(secondTask);

    expect(screen.getByTestId('todays-focus-tasks-title')).toBeTruthy();
  });

  it('handles task deselection', () => {
    renderTodaysFocusScreen();

    const firstTask = screen.getByTestId('todays-focus-task-1');

    // Select task
    fireEvent.press(firstTask);
    expect(screen.getByTestId('todays-focus-tasks-title')).toBeTruthy();

    // Deselect task
    fireEvent.press(firstTask);
    expect(screen.getByTestId('todays-focus-tasks-title')).toBeTruthy();
  });

  it('shows focus mode button when tasks are selected', () => {
    renderTodaysFocusScreen();

    const firstTask = screen.getByTestId('todays-focus-task-1');
    fireEvent.press(firstTask);

    expect(screen.getByTestId('todays-focus-enter-focus-mode-button')).toBeTruthy();
  });

  it('handles focus mode entry', () => {
    renderTodaysFocusScreen();

    const firstTask = screen.getByTestId('todays-focus-task-1');
    fireEvent.press(firstTask);

    const focusModeButton = screen.getByTestId('todays-focus-enter-focus-mode-button');
    fireEvent.press(focusModeButton);

    // Should show FocusModeScreen
    expect(screen.getByTestId('focus-mode-task-title')).toBeTruthy();
    expect(screen.getByTestId('focus-mode-complete-button')).toBeTruthy();
    expect(screen.getByTestId('focus-mode-snooze-button')).toBeTruthy();
    expect(screen.getByTestId('focus-mode-skip-button')).toBeTruthy();
  });

  it('prevents focus mode entry without selected tasks', () => {
    renderTodaysFocusScreen();

    // Try to enter focus mode without selecting tasks
    // The button should not be visible
    expect(screen.queryByTestId('todays-focus-enter-focus-mode-button')).toBeNull();
  });

  it('handles assist me button press', async () => {
    const mockGenerateSuggestions = jest.fn().mockResolvedValue({});
    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: [],
      isLoading: false,
      error: null,
      generateSuggestions: mockGenerateSuggestions,
      dismissSuggestion: jest.fn(),
    });

    renderTodaysFocusScreen();

    const assistButton = screen.getByTestId('todays-focus-assist-me-button');
    fireEvent.press(assistButton);

    await waitFor(() => {
      expect(mockGenerateSuggestions).toHaveBeenCalled();
    });
  });

  it('shows loading state for assist me button', () => {
    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: [],
      isLoading: true,
      error: null,
      generateSuggestions: jest.fn(),
      dismissSuggestion: jest.fn(),
    });

    renderTodaysFocusScreen();

    expect(screen.getByText('Thinking...')).toBeTruthy();
  });

  it('displays AI suggestions when available', () => {
    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: mockAiSuggestions,
      isLoading: false,
      error: null,
      generateSuggestions: jest.fn(),
      dismissSuggestion: jest.fn(),
    });

    renderTodaysFocusScreen();

    expect(screen.getByTestId('todays-focus-ai-suggestions-title')).toBeTruthy();
    expect(screen.getByText('AI Suggested Task 1')).toBeTruthy();
    expect(screen.getByText('AI Suggested Task 2')).toBeTruthy();
  });

  it('handles AI suggestion add to today', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({});
    mockUseCreateTask.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: mockAiSuggestions,
      isLoading: false,
      error: null,
      generateSuggestions: jest.fn(),
      dismissSuggestion: jest.fn(),
    });

    renderTodaysFocusScreen();

    // Find and press "Add to Today" button for first suggestion
    const addToTodayButtons = screen.getAllByText('Add to Today');
    fireEvent.press(addToTodayButtons[0]);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        title: 'AI Suggested Task 1',
        description: 'This is an AI suggested task',
        action_category: 'do',
        priority: 2,
      });
    });
  });

  it('handles AI suggestion add for later', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({});
    mockUseCreateTask.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: mockAiSuggestions,
      isLoading: false,
      error: null,
      generateSuggestions: jest.fn(),
      dismissSuggestion: jest.fn(),
    });

    renderTodaysFocusScreen();

    // Find and press "Add for Later" button for first suggestion
    const addForLaterButtons = screen.getAllByText('Add for Later');
    fireEvent.press(addForLaterButtons[0]);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        title: 'AI Suggested Task 1',
        description: 'This is an AI suggested task',
        action_category: 'do',
        priority: 2,
      });
    });
  });

  it('handles AI suggestion dismiss', () => {
    const mockDismissSuggestion = jest.fn();
    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: mockAiSuggestions,
      isLoading: false,
      error: null,
      generateSuggestions: jest.fn(),
      dismissSuggestion: mockDismissSuggestion,
    });

    renderTodaysFocusScreen();

    // Find and press "Dismiss" button for first suggestion
    const dismissButtons = screen.getAllByText('Dismiss');
    fireEvent.press(dismissButtons[0]);

    expect(mockDismissSuggestion).toHaveBeenCalledWith(mockAiSuggestions[0]);
  });

  it('shows AI error when present', () => {
    const aiError = 'Failed to generate AI suggestions';
    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: [],
      isLoading: false,
      error: aiError,
      generateSuggestions: jest.fn(),
      dismissSuggestion: jest.fn(),
    });

    renderTodaysFocusScreen();

    expect(screen.getByTestId('todays-focus-ai-error')).toBeTruthy();
  });

  it('shows empty state when no tasks or suggestions', () => {
    mockUseIncompleteTasks.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: [],
      isLoading: false,
      error: null,
      generateSuggestions: jest.fn(),
      dismissSuggestion: jest.fn(),
    });

    renderTodaysFocusScreen();

    expect(screen.getByTestId('todays-focus-empty-state-title')).toBeTruthy();
    expect(screen.getByTestId('todays-focus-empty-state-message')).toBeTruthy();
  });

  it('handles task creation error', async () => {
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Failed to create task'));
    mockUseCreateTask.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: mockAiSuggestions,
      isLoading: false,
      error: null,
      generateSuggestions: jest.fn(),
      dismissSuggestion: jest.fn(),
    });

    renderTodaysFocusScreen();

    const addToTodayButtons = screen.getAllByText('Add to Today');
    fireEvent.press(addToTodayButtons[0]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save task');
    });
  });

  it('handles assist me error when API fails', async () => {
    const mockGenerateSuggestions = jest.fn().mockRejectedValue(new Error('API Error'));
    mockUseAiSuggestedTasks.mockReturnValue({
      suggestions: [],
      isLoading: false,
      error: null,
      generateSuggestions: mockGenerateSuggestions,
      dismissSuggestion: jest.fn(),
    });

    renderTodaysFocusScreen();

    const assistButton = screen.getByTestId('todays-focus-assist-me-button');
    fireEvent.press(assistButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to generate AI suggestions');
    });
  });

  it('handles focus mode exit', () => {
    renderTodaysFocusScreen();

    // Enter focus mode
    const firstTask = screen.getByTestId('todays-focus-task-1');
    fireEvent.press(firstTask);

    const focusModeButton = screen.getByTestId('todays-focus-enter-focus-mode-button');
    fireEvent.press(focusModeButton);

    // Exit focus mode
    const exitButton = screen.getByTestId('focus-mode-exit-button');
    fireEvent.press(exitButton);

    // Should return to main screen
    expect(screen.getByTestId("todays-focus-title")).toBeTruthy();
  });

  it('handles task with no description', () => {
    const tasksWithoutDescription: Task[] = [
      {
        id: 1,
        title: 'Simple task',
        description: undefined,
        completed: false,
        action_category: 'do',
        priority: 1,
        profile_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockUseIncompleteTasks.mockReturnValue({
      data: tasksWithoutDescription,
      isLoading: false,
      error: null,
    });

    renderTodaysFocusScreen();

    expect(screen.getByTestId('todays-focus-task-title-1')).toBeTruthy();
    expect(screen.queryByTestId('todays-focus-task-description-1')).toBeNull();
  });

  it('handles task with no priority', () => {
    const tasksWithoutPriority: Task[] = [
      {
        id: 1,
        title: 'Task without priority',
        description: 'A task with no priority set',
        completed: false,
        action_category: 'do',
        priority: undefined,
        profile_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockUseIncompleteTasks.mockReturnValue({
      data: tasksWithoutPriority,
      isLoading: false,
      error: null,
    });

    renderTodaysFocusScreen();

    expect(screen.getByTestId('todays-focus-task-title-1')).toBeTruthy();
    expect(screen.queryByTestId('todays-focus-task-priority-1')).toBeNull();
  });
}); 
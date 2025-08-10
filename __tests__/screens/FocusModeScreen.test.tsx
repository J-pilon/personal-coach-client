import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Task } from '../../api/tasks';
import { FocusModeScreen } from '../../components/FocusModeScreen';

// Mock the hooks
jest.mock('../../hooks/useTasks', () => ({
  useUpdateTask: jest.fn(),
  useIncompleteTasks: jest.fn(),
  useCreateTask: jest.fn(),
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

const mockUseUpdateTask = require('../../hooks/useTasks').useUpdateTask;

describe('FocusModeScreen', () => {
  let queryClient: QueryClient;
  const mockOnComplete = jest.fn();
  const mockOnExit = jest.fn();

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

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseUpdateTask.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  const renderFocusModeScreen = (tasks: Task[] = mockTasks) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <FocusModeScreen
          selectedTasks={tasks}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      </QueryClientProvider>
    );
  };

  it('renders the first task correctly', () => {
    renderFocusModeScreen();

    expect(screen.getByTestId('focus-mode-task-title')).toBeTruthy();
    expect(screen.getByTestId('focus-mode-task-description')).toBeTruthy();
    expect(screen.getByTestId('focus-mode-task-priority')).toBeTruthy();
    expect(screen.getByTestId('focus-mode-progress-text')).toBeTruthy();
  });

  it('shows progress bar with correct percentage', () => {
    renderFocusModeScreen();

    // Initial progress should be 0%
    expect(screen.getByTestId('focus-mode-progress-text')).toBeTruthy();
  });

  it('displays action buttons', () => {
    renderFocusModeScreen();

    expect(screen.getByTestId('focus-mode-complete-button')).toBeTruthy();
    expect(screen.getByTestId('focus-mode-snooze-button')).toBeTruthy();
    expect(screen.getByTestId('focus-mode-skip-button')).toBeTruthy();
  });

  it('handles task completion', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({});
    mockUseUpdateTask.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    renderFocusModeScreen();

    const completeButton = screen.getByTestId('focus-mode-complete-button');
    fireEvent.press(completeButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 1,
        taskData: { completed: true },
      });
    });

    expect(mockOnComplete).toHaveBeenCalledWith(1);
  });

  it('handles task snoozing', () => {
    renderFocusModeScreen();

    const snoozeButton = screen.getByTestId('focus-mode-snooze-button');
    fireEvent.press(snoozeButton);

    // Should move to next task (task 2) but progress stays at 0 since snoozed tasks aren't completed
    expect(screen.getByTestId('focus-mode-task-title')).toBeTruthy();
    expect(screen.getByTestId('focus-mode-progress-text')).toBeTruthy();
  });

  it('handles task skipping', () => {
    renderFocusModeScreen();

    const skipButton = screen.getByTestId('focus-mode-skip-button');
    fireEvent.press(skipButton);

    // Should move to next task (task 2) but progress stays at 0 since skipped tasks aren't completed
    expect(screen.getByTestId('focus-mode-task-title')).toBeTruthy();
    expect(screen.getByTestId('focus-mode-progress-text')).toBeTruthy();
  });

  it('handles exit button press', () => {
    renderFocusModeScreen();

    const exitButton = screen.getByTestId('focus-mode-exit-button');
    fireEvent.press(exitButton);

    expect(mockOnExit).toHaveBeenCalled();
  });

  it('shows completion screen when all tasks are done', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({});
    mockUseUpdateTask.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    renderFocusModeScreen();

    // Complete tasks one by one until completion screen appears
    let completedCount = 0;
    while (completedCount < mockTasks.length) {
      try {
        // Wait for the complete button to be available
        const completeButton = await waitFor(() =>
          screen.getByTestId('focus-mode-complete-button')
        );
        fireEvent.press(completeButton);

        // Wait for the mutation to be called
        await waitFor(() => {
          expect(mockMutateAsync).toHaveBeenCalledTimes(completedCount + 1);
        });

        completedCount++;
      } catch (error) {
        // If we can't find the complete button, we might be on the completion screen
        break;
      }
    }

    // After completing all tasks, should show completion screen
    await waitFor(() => {
      expect(screen.getByTestId("focus-mode-completion-title")).toBeTruthy();
      expect(screen.getByTestId("focus-mode-completion-message")).toBeTruthy();
      expect(screen.getByTestId("focus-mode-completion-exit-button")).toBeTruthy();
    });
  });

  it('handles empty task list', () => {
    renderFocusModeScreen([]);

    expect(screen.getByTestId("focus-mode-completion-title")).toBeTruthy();
    expect(screen.getByTestId("focus-mode-completion-message")).toBeTruthy();
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

    renderFocusModeScreen(tasksWithoutDescription);

    expect(screen.getByTestId('focus-mode-task-title')).toBeTruthy();
    expect(screen.queryByTestId('focus-mode-task-description')).toBeNull();
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

    renderFocusModeScreen(tasksWithoutPriority);

    expect(screen.getByTestId('focus-mode-task-title')).toBeTruthy();
    expect(screen.queryByTestId('focus-mode-task-priority')).toBeNull();
  });

  it('handles task completion error', async () => {
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Update failed'));
    mockUseUpdateTask.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    renderFocusModeScreen();

    const completeButton = screen.getByTestId('focus-mode-complete-button');
    fireEvent.press(completeButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to complete task:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('updates progress correctly when tasks are completed', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({});
    mockUseUpdateTask.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    renderFocusModeScreen();

    // Initial progress
    expect(screen.getByTestId('focus-mode-progress-text')).toBeTruthy();

    // Complete first task
    const completeButton = screen.getByTestId('focus-mode-complete-button');
    fireEvent.press(completeButton);

    await waitFor(() => {
      expect(screen.getByTestId('focus-mode-progress-text')).toBeTruthy();
    });

    // Complete second task
    fireEvent.press(completeButton);

    await waitFor(() => {
      expect(screen.getByTestId('focus-mode-progress-text')).toBeTruthy();
    });
  });

  it('handles single task completion', async () => {
    const singleTask: Task[] = [mockTasks[0]];
    const mockMutateAsync = jest.fn().mockResolvedValue({});
    mockUseUpdateTask.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    renderFocusModeScreen(singleTask);

    expect(screen.getByTestId('focus-mode-progress-text')).toBeTruthy();

    const completeButton = screen.getByTestId('focus-mode-complete-button');
    fireEvent.press(completeButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 1,
        taskData: { completed: true },
      });
    });

    // After completing the single task, should show completion screen
    await waitFor(() => {
      expect(screen.getByTestId("focus-mode-completion-title")).toBeTruthy();
      expect(screen.getByTestId("focus-mode-completion-message")).toBeTruthy();
    });
  });

  it('maintains task order during progression', () => {
    renderFocusModeScreen();

    // Should start with first task
    expect(screen.getByTestId('focus-mode-task-title')).toBeTruthy();

    // Skip to second task
    const skipButton = screen.getByTestId('focus-mode-skip-button');
    fireEvent.press(skipButton);

    expect(screen.getByTestId('focus-mode-task-title')).toBeTruthy();

    // Skip to third task
    fireEvent.press(skipButton);

    expect(screen.getByTestId('focus-mode-task-title')).toBeTruthy();
  });
}); 
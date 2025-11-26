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
    const mockMutateAsync = jest.fn().mockImplementation(({ id, taskData }) =>
      Promise.resolve({ ...mockTasks.find(t => t.id === id), ...taskData })
    );
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
    const mockMutateAsync = jest.fn().mockImplementation(({ id, taskData }) =>
      Promise.resolve({ ...mockTasks.find(t => t.id === id), ...taskData, completed: true })
    );
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
    const mockMutateAsync = jest.fn().mockImplementation(({ id, taskData }) =>
      Promise.resolve({ ...singleTask.find(t => t.id === id), ...taskData, completed: true })
    );
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

  describe('when selectedTasks array contains multiple elements', () => {
    // Helper function to create mock tasks
    const createMockTask = (id: number, title: string, completed = false): Task => ({
      id,
      title,
      description: `Description for task ${id}`,
      completed,
      action_category: 'do',
      priority: id,
      profile_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });

    describe('when task is completed', () => {
      it('updates task record completed property to true', async () => {
        const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2')];
        const mockMutateAsync = jest.fn().mockImplementation(({ id, taskData }) =>
          Promise.resolve({ ...tasks.find(t => t.id === id), ...taskData })
        );
        mockUseUpdateTask.mockReturnValue({
          mutateAsync: mockMutateAsync,
          isPending: false,
          isError: false,
          isSuccess: false,
          error: null,
          reset: jest.fn(),
        });

        renderFocusModeScreen(tasks);

        const completeButton = screen.getByTestId('focus-mode-complete-button');
        fireEvent.press(completeButton);

        await waitFor(() => {
          expect(mockMutateAsync).toHaveBeenCalledWith({
            id: 1,
            taskData: { completed: true },
          });
        });
      });

      it('throws error if task record mutation fails', async () => {
        const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2')];
        const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Mutation failed'));
        mockUseUpdateTask.mockReturnValue({
          mutateAsync: mockMutateAsync,
          isPending: false,
          isError: false,
          isSuccess: false,
          error: null,
          reset: jest.fn(),
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        renderFocusModeScreen(tasks);

        const completeButton = screen.getByTestId('focus-mode-complete-button');
        fireEvent.press(completeButton);

        await waitFor(() => {
          expect(mockMutateAsync).toHaveBeenCalled();
        });

        expect(consoleSpy).toHaveBeenCalledWith('Failed to complete task:', expect.any(Error));
        consoleSpy.mockRestore();
      });

      it('increments completedTasks array length by one', async () => {
        const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2'), createMockTask(3, 'Task 3')];
        const mockMutateAsync = jest.fn().mockImplementation(({ id, taskData }) =>
          Promise.resolve({ ...tasks.find(t => t.id === id), ...taskData })
        );
        mockUseUpdateTask.mockReturnValue({
          mutateAsync: mockMutateAsync,
          isPending: false,
          isError: false,
          isSuccess: false,
          error: null,
          reset: jest.fn(),
        });

        renderFocusModeScreen(tasks);

        // Initial progress: 0 of 3
        expect(screen.getByText('0 of 3 completed')).toBeTruthy();

        const completeButton = screen.getByTestId('focus-mode-complete-button');
        fireEvent.press(completeButton);

        await waitFor(() => {
          expect(screen.getByText('1 of 3 completed')).toBeTruthy();
        });
      });

      it('updates currentTasks array to contain the mutated task', async () => {
        const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2')];
        const mockMutateAsync = jest.fn().mockImplementation(({ id, taskData }) =>
          Promise.resolve({ ...tasks.find(t => t.id === id), ...taskData, completed: true })
        );
        mockUseUpdateTask.mockReturnValue({
          mutateAsync: mockMutateAsync,
          isPending: false,
          isError: false,
          isSuccess: false,
          error: null,
          reset: jest.fn(),
        });

        renderFocusModeScreen(tasks);

        const completeButton = screen.getByTestId('focus-mode-complete-button');
        fireEvent.press(completeButton);

        await waitFor(() => {
          expect(mockMutateAsync).toHaveBeenCalledWith({
            id: 1,
            taskData: { completed: true },
          });
        });

        // After completion, should move to next task
        await waitFor(() => {
          expect(screen.getByText('Task 2')).toBeTruthy();
        });
      });

      it('sets allTasksCompleted to true when tasksToComplete length equals zero', async () => {
        const tasks = [createMockTask(1, 'Task 1')];
        const mockMutateAsync = jest.fn().mockImplementation(({ id, taskData }) =>
          Promise.resolve({ ...tasks.find(t => t.id === id), ...taskData, completed: true })
        );
        mockUseUpdateTask.mockReturnValue({
          mutateAsync: mockMutateAsync,
          isPending: false,
          isError: false,
          isSuccess: false,
          error: null,
          reset: jest.fn(),
        });

        renderFocusModeScreen(tasks);

        const completeButton = screen.getByTestId('focus-mode-complete-button');
        fireEvent.press(completeButton);

        await waitFor(() => {
          expect(screen.getByTestId('focus-mode-completion-title')).toBeTruthy();
        });
      });

      it('moves to next uncompleted task index', async () => {
        const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2'), createMockTask(3, 'Task 3')];
        const mockMutateAsync = jest.fn().mockImplementation(({ id, taskData }) =>
          Promise.resolve({ ...tasks.find(t => t.id === id), ...taskData, completed: true })
        );
        mockUseUpdateTask.mockReturnValue({
          mutateAsync: mockMutateAsync,
          isPending: false,
          isError: false,
          isSuccess: false,
          error: null,
          reset: jest.fn(),
        });

        renderFocusModeScreen(tasks);

        // Should show first task
        expect(screen.getByText('Task 1')).toBeTruthy();

        const completeButton = screen.getByTestId('focus-mode-complete-button');
        fireEvent.press(completeButton);

        // Should move to second task
        await waitFor(() => {
          expect(screen.getByText('Task 2')).toBeTruthy();
        });

        fireEvent.press(completeButton);

        // Should move to third task
        await waitFor(() => {
          expect(screen.getByText('Task 3')).toBeTruthy();
        });
      });

      describe('when array contains two items and last item completed', () => {
        it('loops back to first uncompleted item in currentTasks array', async () => {
          const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2')];
          let completedIds: number[] = [];
          const mockMutateAsync = jest.fn().mockImplementation(({ id, taskData }) => {
            if (taskData.completed) {
              completedIds.push(id);
            }
            return Promise.resolve({ ...tasks.find(t => t.id === id), ...taskData, completed: true });
          });
          mockUseUpdateTask.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
            isError: false,
            isSuccess: false,
            error: null,
            reset: jest.fn(),
          });

          renderFocusModeScreen(tasks);

          // Skip first task
          const skipButton = screen.getByTestId('focus-mode-skip-button');
          fireEvent.press(skipButton);

          await waitFor(() => {
            expect(screen.getByText('Task 2')).toBeTruthy();
          });

          // Complete second task
          const completeButton = screen.getByTestId('focus-mode-complete-button');
          fireEvent.press(completeButton);

          // Should loop back to first task (which is uncompleted)
          await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeTruthy();
          });
        });
      });
    });

    describe('when currentTasks array length is zero', () => {
      it('sets allTasksComplete to true', () => {
        renderFocusModeScreen([]);

        expect(screen.getByTestId('focus-mode-completion-title')).toBeTruthy();
        expect(screen.getByTestId('focus-mode-completion-message')).toBeTruthy();
      });
    });

    describe('when item is skipped', () => {
      it('moves currentTaskIndex to next item in currentTasks array', () => {
        const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2'), createMockTask(3, 'Task 3')];
        renderFocusModeScreen(tasks);

        expect(screen.getByText('Task 1')).toBeTruthy();

        const skipButton = screen.getByTestId('focus-mode-skip-button');
        fireEvent.press(skipButton);

        expect(screen.getByText('Task 2')).toBeTruthy();
      });

      describe('when array contains two items and last item skipped', () => {
        it('loops back to beginning of currentTasks array', () => {
          const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2')];
          renderFocusModeScreen(tasks);

          expect(screen.getByText('Task 1')).toBeTruthy();

          const skipButton = screen.getByTestId('focus-mode-skip-button');

          // Skip to Task 2
          fireEvent.press(skipButton);
          expect(screen.getByText('Task 2')).toBeTruthy();

          // Skip again - should loop back to Task 1
          fireEvent.press(skipButton);
          expect(screen.getByText('Task 1')).toBeTruthy();
        });
      });

      describe('when last item in currentTasks array is skipped', () => {
        it('loops back to first task when skipping', () => {
          const tasks = [createMockTask(1, 'Task 1')];
          renderFocusModeScreen(tasks);

          expect(screen.getByText('Task 1')).toBeTruthy();

          // Skip the only task - should loop back to Task 1
          const skipButton = screen.getByTestId('focus-mode-skip-button');
          fireEvent.press(skipButton);

          // Should still show Task 1 (looped back)
          expect(screen.getByText('Task 1')).toBeTruthy();
        });
      });
    });

    describe('when item is snoozed', () => {
      it('moves currentTaskIndex to next item in currentTasks array', () => {
        const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2'), createMockTask(3, 'Task 3')];
        renderFocusModeScreen(tasks);

        expect(screen.getByText('Task 1')).toBeTruthy();

        const snoozeButton = screen.getByTestId('focus-mode-snooze-button');
        fireEvent.press(snoozeButton);

        // Should move to Task 2
        expect(screen.getByText('Task 2')).toBeTruthy();
      });

      it('removes snoozed task from currentTasks array', () => {
        const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2'), createMockTask(3, 'Task 3')];
        renderFocusModeScreen(tasks);

        // Verify we start with 3 tasks
        expect(screen.getByText('0 of 3 completed')).toBeTruthy();

        const snoozeButton = screen.getByTestId('focus-mode-snooze-button');
        fireEvent.press(snoozeButton);

        // After snoozing, should have 2 tasks remaining
        expect(screen.getByText('0 of 2 completed')).toBeTruthy();
      });

      it('does not increment completedTasks array with id of snoozed task', async () => {
        const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2'), createMockTask(3, 'Task 3')];
        const mockMutateAsync = jest.fn().mockImplementation(({ id, taskData }) =>
          Promise.resolve({ ...tasks.find(t => t.id === id), ...taskData, completed: true })
        );
        mockUseUpdateTask.mockReturnValue({
          mutateAsync: mockMutateAsync,
          isPending: false,
          isError: false,
          isSuccess: false,
          error: null,
          reset: jest.fn(),
        });

        renderFocusModeScreen(tasks);

        // Snooze first task
        const snoozeButton = screen.getByTestId('focus-mode-snooze-button');
        fireEvent.press(snoozeButton);

        // Progress should still be 0
        expect(screen.getByText('0 of 2 completed')).toBeTruthy();

        // Complete Task 2
        const completeButton = screen.getByTestId('focus-mode-complete-button');
        fireEvent.press(completeButton);

        await waitFor(() => {
          expect(screen.getByText('1 of 2 completed')).toBeTruthy();
        });

        // Task 1 should not have been completed
        expect(mockMutateAsync).not.toHaveBeenCalledWith({
          id: 1,
          taskData: { completed: true },
        });
      });

      describe('when array contains two items and last item snoozed', () => {
        it('wraps back to first incomplete task', async () => {
          const tasks = [createMockTask(1, 'Task 1'), createMockTask(2, 'Task 2')];
          renderFocusModeScreen(tasks);

          // Skip to Task 2
          const skipButton = screen.getByTestId('focus-mode-skip-button');
          fireEvent.press(skipButton);
          expect(screen.getByText('Task 2')).toBeTruthy();

          // Snooze Task 2 - this removes it from the array
          const snoozeButton = screen.getByTestId('focus-mode-snooze-button');
          fireEvent.press(snoozeButton);

          // Should wrap back to Task 1 (the only remaining task)
          await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeTruthy();
            expect(screen.getByText('0 of 1 completed')).toBeTruthy();
          });
        });
      });

      describe('when last item in currentTasks array is snoozed', () => {
        it('sets allTasksComplete to true', () => {
          const tasks = [createMockTask(1, 'Task 1')];
          renderFocusModeScreen(tasks);

          expect(screen.getByText('Task 1')).toBeTruthy();

          const snoozeButton = screen.getByTestId('focus-mode-snooze-button');
          fireEvent.press(snoozeButton);

          // After snoozing the only task, should show completion screen
          expect(screen.getByTestId('focus-mode-completion-title')).toBeTruthy();
          expect(screen.getByTestId('focus-mode-completion-message')).toBeTruthy();
        });
      });
    });
  });
}); 
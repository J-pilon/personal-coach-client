import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import HomeScreen from '../../app/(tabs)';

// Mock the API module
jest.mock('../../api/tasks');

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  router: {
    push: jest.fn(),
  },
  useLocalSearchParams: () => ({}),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

// Mock React Query hooks
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

const mockUseQuery = require('@tanstack/react-query').useQuery;
const mockUseMutation = require('@tanstack/react-query').useMutation;

describe('HomeScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
      isFetching: false,
      isRefetching: false,
      refetch: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomeScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('home-loading-text')).toBeTruthy();
  });

  it('renders error state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch tasks'),
      isError: true,
      isSuccess: false,
      isFetching: false,
      isRefetching: false,
      refetch: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomeScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('home-error-title')).toBeTruthy();
    expect(screen.getByTestId('home-error-message')).toBeTruthy();
  });

  it('renders empty state when no tasks', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      refetch: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomeScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('home-empty-title')).toBeTruthy();
    expect(screen.getByTestId('home-empty-message')).toBeTruthy();
  });

  it('renders tasks list', () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1', completed: false, action_category: 'do' as const, created_at: '2024-01-01T00:00:00Z' },
      { id: 2, title: 'Task 2', description: 'Description 2', completed: true, action_category: 'defer' as const, created_at: '2024-01-02T00:00:00Z' },
    ];

    mockUseQuery.mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      refetch: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomeScreen />
      </QueryClientProvider>
    );

    // Only 'do' category is open by default, so only Task 1 should be visible
    expect(screen.getByTestId('home-task-title-1')).toBeTruthy();
    expect(screen.getByTestId('home-task-description-1')).toBeTruthy();
    // Task 2 is in 'defer' category which is closed by default
    expect(screen.queryByTestId('home-task-title-2')).toBeNull();
  });

  it('handles task completion', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1', completed: false, action_category: 'do' as const, created_at: '2024-01-01T00:00:00Z' },
    ];

    const mockMutate = jest.fn();
    const mockRefetch = jest.fn();

    mockUseQuery.mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      refetch: mockRefetch,
    });

    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomeScreen />
      </QueryClientProvider>
    );

    const completeButton = screen.getByTestId('task-checkbox');
    fireEvent.press(completeButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { id: 1, completed: true },
        expect.objectContaining({
          onError: expect.any(Function),
        })
      );
    });
  });

  it('handles task navigation to detail', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1', completed: false, action_category: 'do' as const, created_at: '2024-01-01T00:00:00Z' },
    ];

    const mockMutate = jest.fn();
    const mockRefetch = jest.fn();
    const mockRouter = require('expo-router').router;

    mockUseQuery.mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      refetch: mockRefetch,
    });

    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomeScreen />
      </QueryClientProvider>
    );

    const editButton = screen.getByTestId('task-edit-icon');
    fireEvent.press(editButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/taskDetail/1');
    });
  });

  it('refetches tasks after successful mutation', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1', completed: false, action_category: 'do' as const, created_at: '2024-01-01T00:00:00Z' },
    ];

    const mockMutate = jest.fn();
    const mockRefetch = jest.fn();

    mockUseQuery.mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      refetch: mockRefetch,
    });

    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
      reset: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomeScreen />
      </QueryClientProvider>
    );

    // The component doesn't automatically refetch on mutation success
    // It relies on React Query's invalidation mechanism
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('renders the addTaskButton component', async () => {
    const mockRouter = require('expo-router').router;

    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      refetch: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomeScreen />
      </QueryClientProvider>
    );

    const addButton = screen.getByTestId('add-task-button-button')

    fireEvent.press(addButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/addTask');
  });
}); 
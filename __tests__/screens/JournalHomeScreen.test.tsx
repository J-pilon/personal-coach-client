import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import JournalScreen from '../../app/(tabs)/journal';

jest.mock('../../api/journals');

jest.mock('../../hooks/useJournal', () => ({
  useJournal: jest.fn(),
  useJournalEntries: jest.fn(),
  useCreateJournalEntry: jest.fn(),
  useJournalEntry: jest.fn(),
  useUpdateJournalEntry: jest.fn(),
  useDeleteJournalEntry: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}));

const mockUseJournalEntries = require('../../hooks/useJournal').useJournalEntries;
const mockRouterPush = require('expo-router').router.push;

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <JournalScreen />
    </QueryClientProvider>,
  );
}

describe('JournalScreen (Home)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the loading state while entries load', () => {
    mockUseJournalEntries.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();
    expect(screen.getByTestId('journal-home-loading')).toBeTruthy();
  });

  it('renders an error state when the query fails', () => {
    mockUseJournalEntries.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
      refetch: jest.fn(),
    });

    renderScreen();
    expect(screen.getByTestId('journal-home-error-title')).toBeTruthy();
    expect(screen.getByTestId('journal-home-error-message')).toBeTruthy();
  });

  it('renders the empty state when there are no entries', () => {
    mockUseJournalEntries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();
    expect(screen.getByTestId('journal-home-title')).toBeTruthy();
    expect(screen.getByTestId('journal-home-prompt')).toBeTruthy();
    expect(screen.getByTestId('journal-home-empty')).toBeTruthy();
  });

  it('renders recent entries when the query has data', () => {
    mockUseJournalEntries.mockReturnValue({
      data: [
        {
          id: 1,
          journal_id: 1,
          profile_id: 1,
          title: 'Productive Monday',
          body: 'Shipped the journal models today.',
          entry_type: 'daily_journal',
          occurred_on: '2026-05-22',
        },
        {
          id: 2,
          journal_id: 1,
          profile_id: 1,
          title: null,
          body: 'Last week I focused too much on infra.',
          entry_type: 'weekly_reflection',
          occurred_on: '2026-05-17',
        },
      ],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();
    expect(screen.getByTestId('journal-home-recent-list')).toBeTruthy();
    expect(screen.getByTestId('journal-entry-row-1')).toBeTruthy();
    expect(screen.getByTestId('journal-entry-row-2')).toBeTruthy();
  });

  it('routes to the daily entry form when the daily CTA is pressed', () => {
    mockUseJournalEntries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();
    fireEvent.press(screen.getByTestId('journal-home-cta-daily'));
    expect(mockRouterPush).toHaveBeenCalledWith('/journal/new?entry_type=daily_journal');
  });

  it('routes to the weekly entry form when the weekly CTA is pressed', () => {
    mockUseJournalEntries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();
    fireEvent.press(screen.getByTestId('journal-home-cta-weekly'));
    expect(mockRouterPush).toHaveBeenCalledWith('/journal/new?entry_type=weekly_reflection');
  });
});

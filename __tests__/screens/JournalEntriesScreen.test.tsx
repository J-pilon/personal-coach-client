import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import JournalEntriesScreen from '../../app/journal/[journalId]/journalEntries';

jest.mock('../../api/journals');

jest.mock('../../hooks/useJournal', () => ({
  useJournal: jest.fn(),
  useJournalEntries: jest.fn(),
  useCreateJournalEntry: jest.fn(),
  useJournalEntry: jest.fn(),
  useUpdateJournalEntry: jest.fn(),
  useDeleteJournalEntry: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({ journalId: '1' })),
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}));

const mockUseJournalEntries = require('../../hooks/useJournal').useJournalEntries;
const mockRouterPush = require('expo-router').router.push;
const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <JournalEntriesScreen />
    </QueryClientProvider>,
  );
}

describe('JournalEntriesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ journalId: '1' });
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
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/journal/1/journalEntries/new?entry_type=daily_journal',
    );
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
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/journal/1/journalEntries/new?entry_type=weekly_reflection',
    );
  });

  it('navigates to the entry detail screen when a row is tapped', () => {
    mockUseJournalEntries.mockReturnValue({
      data: [
        {
          id: 7,
          journal_id: 1,
          profile_id: 1,
          title: 'Tap me',
          body: 'Some body',
          entry_type: 'daily_journal',
          occurred_on: '2026-05-22',
        },
      ],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();
    fireEvent.press(screen.getByTestId('journal-entry-row-7'));
    expect(mockRouterPush).toHaveBeenCalledWith('/journal/1/journalEntries/7');
  });

  it('passes the entry_type filter to useJournalEntries when a chip is selected', () => {
    mockUseJournalEntries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();

    fireEvent.press(screen.getByTestId('journal-home-filter-type-weekly_reflection'));

    const lastCallArgs = mockUseJournalEntries.mock.calls.at(-1)?.[0];
    expect(lastCallArgs).toEqual({ entry_type: 'weekly_reflection' });
  });

  it('renders the Clear control once a filter is active and resets state when pressed', () => {
    mockUseJournalEntries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();

    expect(screen.queryByTestId('journal-home-filters-clear')).toBeNull();

    fireEvent.press(screen.getByTestId('journal-home-filter-type-general'));
    expect(screen.getByTestId('journal-home-filters-clear')).toBeTruthy();

    fireEvent.press(screen.getByTestId('journal-home-filters-clear'));
    const lastCallArgs = mockUseJournalEntries.mock.calls.at(-1)?.[0];
    expect(lastCallArgs).toEqual({});
  });

  it('shows the filtered empty-state copy when filters are active and the list is empty', () => {
    mockUseJournalEntries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();

    fireEvent.press(screen.getByTestId('journal-home-filter-type-daily_journal'));
    expect(screen.getByText('No entries match these filters')).toBeTruthy();
  });
});

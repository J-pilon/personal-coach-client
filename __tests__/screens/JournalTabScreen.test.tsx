import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import JournalTabScreen from '../../app/(tabs)/journal';

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
  Redirect: ({ href }: { href: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'journal-tab-redirect' }, href);
  },
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}));

const mockUseJournal = require('../../hooks/useJournal').useJournal;

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <JournalTabScreen />
    </QueryClientProvider>,
  );
}

describe('JournalTabScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a loading state while the default journal loads', () => {
    mockUseJournal.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();
    expect(screen.getByTestId('journal-tab-loading')).toBeTruthy();
  });

  it('renders an error state with retry when the journal fetch fails', () => {
    const refetch = jest.fn();
    mockUseJournal.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
      refetch,
    });

    renderScreen();
    expect(screen.getByTestId('journal-tab-error-title')).toBeTruthy();
    expect(screen.getByTestId('journal-tab-error-message')).toBeTruthy();

    fireEvent.press(screen.getByTestId('journal-tab-retry-button'));
    expect(refetch).toHaveBeenCalled();
  });

  it('redirects to the nested journalEntries route once the journal is loaded', () => {
    mockUseJournal.mockReturnValue({
      data: { id: 7, title: 'Default', kind: 'default' },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderScreen();
    const redirect = screen.getByTestId('journal-tab-redirect');
    expect(redirect.props.children).toBe('/journal/7/journalEntries');
  });
});

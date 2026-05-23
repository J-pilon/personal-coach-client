import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import EditJournalEntryScreen from '../../app/journal/[journalId]/journalEntries/[entryId]/edit';

jest.mock('../../api/journals');

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
}));

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
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}));

jest.mock('../../components/ToastManager', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

const mockUseJournalEntry = require('../../hooks/useJournal').useJournalEntry;
const mockUseUpdateJournalEntry = require('../../hooks/useJournal').useUpdateJournalEntry;
const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
const mockRouterBack = require('expo-router').router.back;

const existingEntry = {
  id: 42,
  journal_id: 1,
  profile_id: 1,
  title: 'Original title',
  body: 'Original body text.',
  entry_type: 'weekly_reflection' as const,
  occurred_on: '2026-05-17',
};

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <EditJournalEntryScreen />
    </QueryClientProvider>,
  );
}

function mockEntryQuery(
  overrides: Partial<{ data: any; isLoading: boolean; error: unknown }> = {},
) {
  mockUseJournalEntry.mockReturnValue({
    data: overrides.data ?? undefined,
    isLoading: overrides.isLoading ?? false,
    error: overrides.error ?? null,
    refetch: jest.fn(),
  });
}

function mockUpdateMutation(overrides: Partial<{ mutate: jest.Mock; isPending: boolean }> = {}) {
  const mutate = overrides.mutate ?? jest.fn();
  mockUseUpdateJournalEntry.mockReturnValue({
    mutate,
    isPending: overrides.isPending ?? false,
    isError: false,
    isSuccess: false,
    error: null,
    reset: jest.fn(),
  });
  return mutate;
}

describe('EditJournalEntryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ journalId: '1', entryId: '42' });
    mockUpdateMutation();
    mockEntryQuery();
  });

  it('shows a loading state while fetching the entry', () => {
    mockEntryQuery({ data: undefined, isLoading: true });

    renderScreen();

    expect(screen.getByTestId('journal-form-loading')).toBeTruthy();
  });

  it('shows an error state when the entry cannot be loaded', () => {
    mockEntryQuery({ data: undefined, isLoading: false, error: new Error('Not found') });

    renderScreen();

    expect(screen.getByTestId('journal-form-error-title')).toBeTruthy();
    expect(screen.getByTestId('journal-form-error-message')).toBeTruthy();
  });

  it('renders the edit heading and prefills the form once the entry loads', () => {
    mockEntryQuery({ data: existingEntry });

    renderScreen();

    expect(screen.getByTestId('journal-form-heading').props.children).toBe('Edit entry');
    expect(screen.getByTestId('journal-form-title-input').props.value).toBe('Original title');
    expect(screen.getByTestId('journal-form-body-input').props.value).toBe('Original body text.');
  });

  it('shows the Update entry label', () => {
    mockEntryQuery({ data: existingEntry });

    renderScreen();

    expect(screen.getByText('Update entry')).toBeTruthy();
  });

  it('submits via the update mutation and navigates back on success', async () => {
    const updateMutate = mockUpdateMutation();
    mockEntryQuery({ data: existingEntry });

    renderScreen();

    fireEvent.changeText(screen.getByTestId('journal-form-body-input'), 'Revised body.');

    const saveButton = screen.getByTestId('journal-form-save-button');
    await waitFor(() => {
      expect(saveButton.props.accessibilityState?.disabled).toBe(false);
    });

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalledWith(
        {
          id: 42,
          params: {
            title: 'Original title',
            body: 'Revised body.',
            entry_type: 'weekly_reflection',
            occurred_on: '2026-05-17',
          },
        },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
      );
    });

    const onSuccess = updateMutate.mock.calls[0][1].onSuccess;
    onSuccess();
    expect(mockRouterBack).toHaveBeenCalled();
  });
});

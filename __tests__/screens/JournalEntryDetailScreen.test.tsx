import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import JournalEntryDetailScreen from '../../app/journal/[journalId]/journalEntries/[entryId]';

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
const mockUseDeleteJournalEntry = require('../../hooks/useJournal').useDeleteJournalEntry;
const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
const mockRouterPush = require('expo-router').router.push;
const mockRouterBack = require('expo-router').router.back;

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <JournalEntryDetailScreen />
    </QueryClientProvider>,
  );
}

function mockEntry(overrides: Partial<{ data: any; isLoading: boolean; error: unknown }> = {}) {
  mockUseJournalEntry.mockReturnValue({
    data: overrides.data ?? undefined,
    isLoading: overrides.isLoading ?? false,
    error: overrides.error ?? null,
    refetch: jest.fn(),
  });
}

function mockDeleteMutation(overrides: Partial<{ mutate: jest.Mock; isPending: boolean }> = {}) {
  const mutate = overrides.mutate ?? jest.fn();
  mockUseDeleteJournalEntry.mockReturnValue({
    mutate,
    isPending: overrides.isPending ?? false,
    isError: false,
    isSuccess: false,
    error: null,
    reset: jest.fn(),
  });
  return mutate;
}

const sampleEntry = {
  id: 42,
  journal_id: 1,
  profile_id: 1,
  title: 'Sample title',
  body: 'A reflective body of text.',
  entry_type: 'weekly_reflection' as const,
  occurred_on: '2026-05-17',
};

describe('JournalEntryDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ journalId: '1', entryId: '42' });
    mockDeleteMutation();
  });

  it('renders the loading state while the entry loads', () => {
    mockEntry({ isLoading: true });

    renderScreen();
    expect(screen.getByTestId('journal-entry-detail-loading')).toBeTruthy();
  });

  it('renders the error state when the entry fails to load', () => {
    mockEntry({ error: new Error('Not found') });

    renderScreen();
    expect(screen.getByTestId('journal-entry-detail-error-title')).toBeTruthy();
    expect(screen.getByTestId('journal-entry-detail-error-message')).toBeTruthy();
  });

  it('renders the entry title, body, and entry type label when data is available', () => {
    mockEntry({ data: sampleEntry });

    renderScreen();
    expect(screen.getByTestId('journal-entry-detail-title').props.children).toBe('Sample title');
    expect(screen.getByTestId('journal-entry-detail-body').props.children).toBe(
      'A reflective body of text.',
    );
    expect(screen.getByTestId('journal-entry-detail-entry-type').props.children).toBe(
      'Weekly reflection',
    );
  });

  it('hides the title block when the entry has no title', () => {
    mockEntry({ data: { ...sampleEntry, title: null } });

    renderScreen();
    expect(screen.queryByTestId('journal-entry-detail-title')).toBeNull();
    expect(screen.getByTestId('journal-entry-detail-body')).toBeTruthy();
  });

  it('navigates to the edit form when Edit is pressed', () => {
    mockEntry({ data: sampleEntry });

    renderScreen();
    fireEvent.press(screen.getByTestId('journal-entry-detail-edit-button'));
    expect(mockRouterPush).toHaveBeenCalledWith('/journal/1/journalEntries/42/edit');
  });

  it('prompts for confirmation before deleting and calls the mutation on confirm', () => {
    mockEntry({ data: sampleEntry });
    const mutate = mockDeleteMutation();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    renderScreen();
    fireEvent.press(screen.getByTestId('journal-entry-detail-delete-button'));

    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [, , buttons] = alertSpy.mock.calls[0] as [string, string, Array<{ text: string; onPress?: () => void }>];
    const deleteButton = buttons.find((b) => b.text === 'Delete');
    expect(deleteButton).toBeDefined();

    deleteButton?.onPress?.();
    expect(mutate).toHaveBeenCalledWith(42, expect.objectContaining({ onSuccess: expect.any(Function) }));

    const onSuccess = mutate.mock.calls[0][1].onSuccess;
    onSuccess();
    expect(mockRouterBack).toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('does not call the delete mutation when the user cancels', () => {
    mockEntry({ data: sampleEntry });
    const mutate = mockDeleteMutation();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    renderScreen();
    fireEvent.press(screen.getByTestId('journal-entry-detail-delete-button'));

    const [, , buttons] = alertSpy.mock.calls[0] as [string, string, Array<{ text: string; onPress?: () => void }>];
    const cancelButton = buttons.find((b) => b.text === 'Cancel');
    cancelButton?.onPress?.();

    expect(mutate).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

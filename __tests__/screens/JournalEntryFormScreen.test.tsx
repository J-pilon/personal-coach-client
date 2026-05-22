import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import NewJournalEntryScreen from '../../app/journal/new';

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

const mockUseCreateJournalEntry = require('../../hooks/useJournal').useCreateJournalEntry;
const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
const mockRouterReplace = require('expo-router').router.replace;

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NewJournalEntryScreen />
    </QueryClientProvider>,
  );
}

function mockMutation(overrides: Partial<{ mutate: jest.Mock; isPending: boolean }> = {}) {
  const mutate = overrides.mutate ?? jest.fn();
  mockUseCreateJournalEntry.mockReturnValue({
    mutate,
    isPending: overrides.isPending ?? false,
    isError: false,
    isSuccess: false,
    error: null,
    reset: jest.fn(),
  });
  return mutate;
}

describe('NewJournalEntryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({});
  });

  it('renders the daily heading and prompts when entry_type=daily_journal', () => {
    mockUseLocalSearchParams.mockReturnValue({ entry_type: 'daily_journal' });
    mockMutation();

    renderScreen();

    expect(screen.getByTestId('journal-form-heading').props.children).toBe("Today's reflection");
    const prompts = screen.getByTestId('journal-form-prompts');
    expect(prompts).toBeTruthy();
    expect(screen.getByText('• What progress did I make today?')).toBeTruthy();
  });

  it('renders the weekly heading and prompts when entry_type=weekly_reflection', () => {
    mockUseLocalSearchParams.mockReturnValue({ entry_type: 'weekly_reflection' });
    mockMutation();

    renderScreen();

    expect(screen.getByTestId('journal-form-heading').props.children).toBe('This week in review');
    expect(screen.getByText('• What worked this week?')).toBeTruthy();
  });

  it('hides the prompt block when entry_type=general', () => {
    mockUseLocalSearchParams.mockReturnValue({ entry_type: 'general' });
    mockMutation();

    renderScreen();

    expect(screen.queryByTestId('journal-form-prompts')).toBeNull();
  });

  it('keeps the save button disabled until the body has content', () => {
    mockUseLocalSearchParams.mockReturnValue({ entry_type: 'daily_journal' });
    mockMutation();

    renderScreen();

    const saveButton = screen.getByTestId('journal-form-save-button');
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('submits with trimmed body and entry_type, navigating to the journal tab on success', async () => {
    mockUseLocalSearchParams.mockReturnValue({ entry_type: 'daily_journal' });
    const mutate = mockMutation();

    renderScreen();

    fireEvent.changeText(screen.getByTestId('journal-form-title-input'), '  Today  ');
    fireEvent.changeText(screen.getByTestId('journal-form-body-input'), '  Made real progress.  ');

    const saveButton = screen.getByTestId('journal-form-save-button');
    await waitFor(() => {
      expect(saveButton.props.accessibilityState?.disabled).toBe(false);
    });

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          title: 'Today',
          body: 'Made real progress.',
          entry_type: 'daily_journal',
          occurred_on: expect.any(String),
        },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
      );
    });

    const onSuccess = mutate.mock.calls[0][1].onSuccess;
    onSuccess();
    expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/journal');
  });

  it('sends title as an empty string when left blank', async () => {
    mockUseLocalSearchParams.mockReturnValue({ entry_type: 'general' });
    const mutate = mockMutation();

    renderScreen();

    fireEvent.changeText(screen.getByTestId('journal-form-body-input'), 'A free-form thought.');

    const saveButton = screen.getByTestId('journal-form-save-button');
    await waitFor(() => {
      expect(saveButton.props.accessibilityState?.disabled).toBe(false);
    });

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ title: '', body: 'A free-form thought.', entry_type: 'general' }),
        expect.anything(),
      );
    });
  });

  it('updates the prompts when the entry type toggle changes', () => {
    mockUseLocalSearchParams.mockReturnValue({ entry_type: 'daily_journal' });
    mockMutation();

    renderScreen();
    expect(screen.getByText('• What progress did I make today?')).toBeTruthy();

    fireEvent.press(screen.getByTestId('journal-form-entry-type-weekly_reflection'));
    expect(screen.getByText('• What worked this week?')).toBeTruthy();

    fireEvent.press(screen.getByTestId('journal-form-entry-type-general'));
    expect(screen.queryByTestId('journal-form-prompts')).toBeNull();
  });
});

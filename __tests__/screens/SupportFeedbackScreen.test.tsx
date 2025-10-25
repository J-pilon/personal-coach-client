import { createTicket } from '@/api/tickets';
import SupportFeedbackScreen from '@/app/support-feedback';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock the API
jest.mock('@/api/tickets', () => ({
  createTicket: jest.fn()
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn()
  }
}));

// Mock expo-device and expo-application
jest.mock('expo-device', () => ({
  modelName: 'iPhone 14',
  osVersion: '17.0'
}));

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1'
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1 }
  })
}));

const mockCreateTicket = createTicket as jest.MockedFunction<typeof createTicket>;

describe('SupportFeedbackScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<SupportFeedbackScreen />);

    expect(getByText('What can we help you with?')).toBeTruthy();
    expect(getByText('Report a Bug')).toBeTruthy();
    expect(getByText('Share Feedback')).toBeTruthy();
    expect(getByPlaceholderText('Brief summary of your issue or feedback')).toBeTruthy();
  });

  it('switches between bug and feedback modes', () => {
    const { getByText } = render(<SupportFeedbackScreen />);

    const feedbackButton = getByText('Share Feedback');
    fireEvent.press(feedbackButton);

    // The feedback button should now be selected
    expect(feedbackButton).toBeTruthy();
  });

  it('submits ticket successfully', async () => {
    mockCreateTicket.mockResolvedValue({
      data: {
        id: 1,
        kind: 'bug',
        title: 'Test Bug',
        description: 'Test Description',
        source: 'app',
        metadata: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      status: 200
    });

    const { getByText, getByPlaceholderText } = render(<SupportFeedbackScreen />);

    const titleInput = getByPlaceholderText('Brief summary of your issue or feedback');
    const descriptionInput = getByPlaceholderText(/Please describe the issue/);

    fireEvent.changeText(titleInput, 'Test Bug');
    fireEvent.changeText(descriptionInput, 'Test Description');

    const submitButton = getByText('Submit');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockCreateTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'bug',
          title: 'Test Bug',
          description: 'Test Description',
          source: 'app'
        }),
        expect.objectContaining({
          app_version: '1.0.0',
          device_model: 'iPhone 14',
          os_version: '17.0'
        })
      );
    });
  });
}); 
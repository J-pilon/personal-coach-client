import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AiTaskCard } from '../../components/AiTaskCard';
import { AiTaskSuggestion } from '../../hooks/useAiSuggestedTasks';

describe('AiTaskCard', () => {
  const mockSuggestion: AiTaskSuggestion = {
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the current project',
    goal_id: 'goal-1',
    time_estimate_minutes: 60,
  };

  const mockOnAddToToday = jest.fn();
  const mockOnAddForLater = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAiTaskCard = (suggestion: AiTaskSuggestion = mockSuggestion) => {
    return render(
      <AiTaskCard
        suggestion={suggestion}
        onAddToToday={mockOnAddToToday}
        onAddForLater={mockOnAddForLater}
        onDismiss={mockOnDismiss}
      />
    );
  };

  it('renders the suggestion title correctly', () => {
    renderAiTaskCard();

    expect(screen.getByText('Complete project documentation')).toBeTruthy();
  });

  it('renders the suggestion description correctly', () => {
    renderAiTaskCard();

    expect(screen.getByText('Write comprehensive documentation for the current project')).toBeTruthy();
  });

  it('renders the time estimate correctly', () => {
    renderAiTaskCard();

    expect(screen.getByText('60 min')).toBeTruthy();
  });

  it('renders the AI badge', () => {
    renderAiTaskCard();

    expect(screen.getByText('AI')).toBeTruthy();
  });

  it('renders all action buttons', () => {
    renderAiTaskCard();

    expect(screen.getByText('Add to Today')).toBeTruthy();
    expect(screen.getByText('Add for Later')).toBeTruthy();
    expect(screen.getByText('Dismiss')).toBeTruthy();
  });

  it('handles add to today button press', () => {
    renderAiTaskCard();

    const addToTodayButton = screen.getByText('Add to Today');
    fireEvent.press(addToTodayButton);

    expect(mockOnAddToToday).toHaveBeenCalledWith(mockSuggestion);
  });

  it('handles add for later button press', () => {
    renderAiTaskCard();

    const addForLaterButton = screen.getByText('Add for Later');
    fireEvent.press(addForLaterButton);

    expect(mockOnAddForLater).toHaveBeenCalledWith(mockSuggestion);
  });

  it('handles dismiss button press', () => {
    renderAiTaskCard();

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.press(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalledWith(mockSuggestion);
  });

  it('handles suggestion without description', () => {
    const suggestionWithoutDescription: AiTaskSuggestion = {
      title: 'Simple task',
      description: null,
      goal_id: 'goal-1',
      time_estimate_minutes: 30,
    };

    renderAiTaskCard(suggestionWithoutDescription);

    expect(screen.getByText('Simple task')).toBeTruthy();
    expect(screen.queryByText('null')).toBeNull();
  });

  it('handles suggestion with zero time estimate', () => {
    const suggestionWithZeroTime: AiTaskSuggestion = {
      title: 'Quick task',
      description: 'A very quick task',
      goal_id: 'goal-1',
      time_estimate_minutes: 0,
    };

    renderAiTaskCard(suggestionWithZeroTime);

    expect(screen.getByText('0 min')).toBeTruthy();
  });

  it('handles suggestion with null goal_id', () => {
    const suggestionWithoutGoal: AiTaskSuggestion = {
      title: 'Task without goal',
      description: 'A task not associated with any goal',
      goal_id: null,
      time_estimate_minutes: 45,
    };

    renderAiTaskCard(suggestionWithoutGoal);

    expect(screen.getByText('Task without goal')).toBeTruthy();
    expect(screen.getByText('45 min')).toBeTruthy();
  });

  it('handles long title and description', () => {
    const longSuggestion: AiTaskSuggestion = {
      title: 'This is a very long task title that might wrap to multiple lines in the UI',
      description: 'This is a very long description that contains a lot of text and might also wrap to multiple lines in the user interface. It should still be displayed correctly.',
      goal_id: 'goal-1',
      time_estimate_minutes: 120,
    };

    renderAiTaskCard(longSuggestion);

    expect(screen.getByText('This is a very long task title that might wrap to multiple lines in the UI')).toBeTruthy();
    expect(screen.getByText('This is a very long description that contains a lot of text and might also wrap to multiple lines in the user interface. It should still be displayed correctly.')).toBeTruthy();
    expect(screen.getByText('120 min')).toBeTruthy();
  });

  it('handles special characters in title and description', () => {
    const specialCharSuggestion: AiTaskSuggestion = {
      title: 'Task with special chars: @#$%^&*()',
      description: 'Description with emojis: 🚀 📝 ✅ and symbols: © ® ™',
      goal_id: 'goal-1',
      time_estimate_minutes: 90,
    };

    renderAiTaskCard(specialCharSuggestion);

    expect(screen.getByText('Task with special chars: @#$%^&*()')).toBeTruthy();
    expect(screen.getByText('Description with emojis: 🚀 📝 ✅ and symbols: © ® ™')).toBeTruthy();
    expect(screen.getByText('90 min')).toBeTruthy();
  });

  it('calls correct callback functions with correct parameters', () => {
    renderAiTaskCard();

    // Test all three buttons
    fireEvent.press(screen.getByText('Add to Today'));
    fireEvent.press(screen.getByText('Add for Later'));
    fireEvent.press(screen.getByText('Dismiss'));

    expect(mockOnAddToToday).toHaveBeenCalledTimes(1);
    expect(mockOnAddToToday).toHaveBeenCalledWith(mockSuggestion);

    expect(mockOnAddForLater).toHaveBeenCalledTimes(1);
    expect(mockOnAddForLater).toHaveBeenCalledWith(mockSuggestion);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    expect(mockOnDismiss).toHaveBeenCalledWith(mockSuggestion);
  });
}); 
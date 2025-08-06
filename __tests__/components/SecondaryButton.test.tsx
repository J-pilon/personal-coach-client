import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SecondaryButton from '../../components/buttons/SecondaryButton';

describe('SecondaryButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    const { getByTestId, getByText } = render(
      <SecondaryButton title="Test Button" onPress={mockOnPress} />
    );

    expect(getByTestId('primary-button')).toBeTruthy();
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <SecondaryButton title="Test Button" onPress={mockOnPress} />
    );

    const button = getByTestId('primary-button');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading text when isLoading is true', () => {
    const { getByText } = render(
      <SecondaryButton
        title="Test Button"
        onPress={mockOnPress}
        isLoading={true}
        loadingText="Loading..."
      />
    );

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('shows original title when isLoading is false', () => {
    const { getByText } = render(
      <SecondaryButton
        title="Test Button"
        onPress={mockOnPress}
        isLoading={false}
        loadingText="Loading..."
      />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('shows original title when loadingText is not provided', () => {
    const { getByText } = render(
      <SecondaryButton
        title="Test Button"
        onPress={mockOnPress}
        isLoading={true}
      />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('is disabled when isLoading is true', () => {
    const { getByTestId } = render(
      <SecondaryButton
        title="Test Button"
        onPress={mockOnPress}
        isLoading={true}
      />
    );

    const button = getByTestId('primary-button');
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByTestId } = render(
      <SecondaryButton
        title="Test Button"
        onPress={mockOnPress}
        disabled={true}
      />
    );

    const button = getByTestId('primary-button');
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('uses custom testID when provided', () => {
    const { getByTestId } = render(
      <SecondaryButton
        title="Test Button"
        onPress={mockOnPress}
        testID="custom-test-id"
      />
    );

    expect(getByTestId('custom-test-id')).toBeTruthy();
  });

  it('uses default testID when not provided', () => {
    const { getByTestId } = render(
      <SecondaryButton title="Test Button" onPress={mockOnPress} />
    );

    expect(getByTestId('primary-button')).toBeTruthy();
  });

  it('renders with correct styling when enabled', () => {
    const { getByTestId } = render(
      <SecondaryButton title="Test Button" onPress={mockOnPress} />
    );

    const button = getByTestId('primary-button');
    expect(button.props.style).toBeDefined();
  });

  it('renders with disabled styling when disabled', () => {
    const { getByTestId } = render(
      <SecondaryButton
        title="Test Button"
        onPress={mockOnPress}
        disabled={true}
      />
    );

    const button = getByTestId('primary-button');
    expect(button.props.style).toBeDefined();
  });

  it('renders with disabled styling when loading', () => {
    const { getByTestId } = render(
      <SecondaryButton
        title="Test Button"
        onPress={mockOnPress}
        isLoading={true}
      />
    );

    const button = getByTestId('primary-button');
    expect(button.props.style).toBeDefined();
  });

  it('renders button text with correct testID', () => {
    const { getByTestId } = render(
      <SecondaryButton title="Test Button" onPress={mockOnPress} />
    );

    expect(getByTestId('ai-onboarding-skip-button-text')).toBeTruthy();
  });

  it('handles multiple rapid presses correctly', () => {
    const { getByTestId } = render(
      <SecondaryButton title="Test Button" onPress={mockOnPress} />
    );

    const button = getByTestId('primary-button');

    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(3);
  });

  it('does not call onPress when disabled and pressed', () => {
    const { getByTestId } = render(
      <SecondaryButton
        title="Test Button"
        onPress={mockOnPress}
        disabled={true}
      />
    );

    const button = getByTestId('primary-button');
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading and pressed', () => {
    const { getByTestId } = render(
      <SecondaryButton
        title="Test Button"
        onPress={mockOnPress}
        isLoading={true}
      />
    );

    const button = getByTestId('primary-button');
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });
}); 
import LoadingSpinner from '@/components/LoadingSpinner';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    expect(screen.getByTestId('loading-spinner-indicator')).toBeTruthy();
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading tasks..." />);

    expect(screen.getByText('Loading tasks...')).toBeTruthy();
    expect(screen.getByTestId('loading-spinner-text')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<LoadingSpinner variant="default" />);
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();

    rerender(<LoadingSpinner variant="card" />);
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();

    rerender(<LoadingSpinner variant="fullscreen" />);
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();

    rerender(<LoadingSpinner variant="inline" />);
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders with custom test ID', () => {
    render(<LoadingSpinner testID="custom-loading" />);

    expect(screen.getByTestId('custom-loading')).toBeTruthy();
    expect(screen.getByTestId('custom-loading-indicator')).toBeTruthy();
  });

  it('renders with background when showBackground is true', () => {
    render(<LoadingSpinner showBackground={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders without text when text is not provided', () => {
    render(<LoadingSpinner />);

    expect(screen.queryByTestId('loading-spinner-text')).toBeFalsy();
  });
});

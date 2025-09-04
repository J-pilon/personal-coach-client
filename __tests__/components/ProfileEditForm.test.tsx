import ProfileEditForm from '@/components/ProfileEditForm';
import { useUpdateProfile } from '@/hooks/useUser';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

// Mock the hooks
jest.mock('@/hooks/useUser', () => ({
  useUpdateProfile: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockProfile = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  work_role: 'Software Engineer',
  education: 'Computer Science',
  desires: 'To build amazing products',
  limiting_beliefs: 'I\'m not good enough',
  onboarding_status: 'complete' as const,
};

const mockUpdateProfile = {
  mutateAsync: jest.fn(),
  isPending: false,
  mutate: jest.fn(),
};

describe('ProfileEditForm', () => {
  const mockOnCancel = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUpdateProfile as jest.Mock).mockReturnValue(mockUpdateProfile);
  });

  it('renders all form fields with profile data', () => {
    const { getByTestId } = render(
      <ProfileEditForm
        profile={mockProfile}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isLoading={false}
      />
    );

    expect(getByTestId('profile-edit-title')).toBeTruthy();
    expect(getByTestId('profile-edit-first-name')).toBeTruthy();
    expect(getByTestId('profile-edit-last-name')).toBeTruthy();
    expect(getByTestId('profile-edit-work-role')).toBeTruthy();
    expect(getByTestId('profile-edit-education')).toBeTruthy();
    expect(getByTestId('profile-edit-desires')).toBeTruthy();
    expect(getByTestId('profile-edit-limiting-beliefs')).toBeTruthy();
    expect(getByTestId('profile-edit-cancel-button')).toBeTruthy();
    expect(getByTestId('profile-edit-save-button')).toBeTruthy();
  });

  it('populates form fields with existing profile data', () => {
    const { getByTestId } = render(
      <ProfileEditForm
        profile={mockProfile}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isLoading={false}
      />
    );

    const firstNameInput = getByTestId('profile-edit-first-name');
    const lastNameInput = getByTestId('profile-edit-last-name');
    const workRoleInput = getByTestId('profile-edit-work-role');
    const educationInput = getByTestId('profile-edit-education');
    const desiresInput = getByTestId('profile-edit-desires');
    const limitingBeliefsInput = getByTestId('profile-edit-limiting-beliefs');

    expect(firstNameInput.props.value).toBe('John');
    expect(lastNameInput.props.value).toBe('Doe');
    expect(workRoleInput.props.value).toBe('Software Engineer');
    expect(educationInput.props.value).toBe('Computer Science');
    expect(desiresInput.props.value).toBe('To build amazing products');
    expect(limitingBeliefsInput.props.value).toBe('I\'m not good enough');
  });

  it('updates form data when user types in inputs', () => {
    const { getByTestId } = render(
      <ProfileEditForm
        profile={mockProfile}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isLoading={false}
      />
    );

    const firstNameInput = getByTestId('profile-edit-first-name');
    const lastNameInput = getByTestId('profile-edit-last-name');

    fireEvent.changeText(firstNameInput, 'Jane');
    fireEvent.changeText(lastNameInput, 'Smith');

    expect(firstNameInput.props.value).toBe('Jane');
    expect(lastNameInput.props.value).toBe('Smith');
  });

  it('calls onSuccess with form data when save button is pressed', async () => {
    const { getByTestId } = render(
      <ProfileEditForm
        profile={mockProfile}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isLoading={false}
      />
    );

    const saveButton = getByTestId('profile-edit-save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        work_role: 'Software Engineer',
        education: 'Computer Science',
        desires: 'To build amazing products',
        limiting_beliefs: 'I\'m not good enough',
      });
    });
  });

  it('calls onSuccess when save button is pressed', async () => {
    const { getByTestId } = render(
      <ProfileEditForm
        profile={mockProfile}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isLoading={false}
      />
    );

    const saveButton = getByTestId('profile-edit-save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles save button press', async () => {
    const { getByTestId } = render(
      <ProfileEditForm
        profile={mockProfile}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isLoading={false}
      />
    );

    const saveButton = getByTestId('profile-edit-save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(
      <ProfileEditForm
        profile={mockProfile}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isLoading={false}
      />
    );

    const cancelButton = getByTestId('profile-edit-cancel-button');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state when isLoading is true', () => {
    const { getByTestId } = render(
      <ProfileEditForm
        profile={mockProfile}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isLoading={true}
      />
    );

    const saveText = getByTestId('primary-button-text');

    // Check that the text shows "Saving..." when loading
    expect(saveText.props.children).toBe('Saving...');
  });

  it('handles empty profile data gracefully', () => {
    const emptyProfile = {
      id: 1,
      first_name: undefined,
      last_name: undefined,
      work_role: undefined,
      education: undefined,
      desires: undefined,
      limiting_beliefs: undefined,
      onboarding_status: 'incomplete' as const,
    };

    const { getByTestId } = render(
      <ProfileEditForm
        profile={emptyProfile}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isLoading={false}
      />
    );

    const firstNameInput = getByTestId('profile-edit-first-name');
    const lastNameInput = getByTestId('profile-edit-last-name');

    expect(firstNameInput.props.value).toBe('');
    expect(lastNameInput.props.value).toBe('');
  });

  it('updates form data when user modifies multiline inputs', () => {
    const { getByTestId } = render(
      <ProfileEditForm
        profile={mockProfile}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isLoading={false}
      />
    );

    const desiresInput = getByTestId('profile-edit-desires');
    const limitingBeliefsInput = getByTestId('profile-edit-limiting-beliefs');

    fireEvent.changeText(desiresInput, 'New desire text');
    fireEvent.changeText(limitingBeliefsInput, 'New limiting belief text');

    expect(desiresInput.props.value).toBe('New desire text');
    expect(limitingBeliefsInput.props.value).toBe('New limiting belief text');
  });
}); 
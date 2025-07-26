# Today's Focus Feature

## Overview

The "Today's Focus" feature provides users with an AI-assisted task management system that helps them prioritize and complete tasks in a focused, distraction-free environment.

## Features

### 🧠 AI Task Suggestions
- **Assist Me Button**: Generates 3 AI-powered task suggestions based on user's current tasks and goals
- **Smart Context**: AI considers user's incomplete tasks, active SMART goals, and profile information
- **Action Options**: Each AI suggestion offers three actions:
  - ✅ **Add to Today**: Temporarily selects for today's focus (local state)
  - ⏳ **Add for Later**: Persists as a real Task record in the database
  - ❌ **Dismiss**: Removes from display without saving

### 🎯 Focus Mode
- **Full-Screen Experience**: Immersive, distraction-free interface
- **One Task at a Time**: Shows tasks sequentially with clear progress tracking
- **Action Buttons**: Complete, Snooze, or Skip each task
- **Progress Tracking**: Visual progress bar and completion counter
- **Smooth Transitions**: Automatic progression to next task

### 📱 User Interface
- **Gradient Design**: Follows the app's gradient UI style with deep blue to cyan gradients
- **Priority Sorting**: Tasks displayed by priority (highest first)
- **Visual Indicators**: AI suggestions marked with 🧠 badge
- **Selection State**: Clear visual feedback for selected tasks

## Components

### `TodaysFocusScreen` (`app/(tabs)/focus.tsx`)
Main screen component that orchestrates the entire flow:
- Displays incomplete tasks sorted by priority
- Manages AI suggestions and user selections
- Handles transitions to Focus Mode
- Provides "Assist Me" functionality

### `useAiSuggestedTasks` (`hooks/useAiSuggestedTasks.ts`)
Custom hook for managing AI task suggestions:
- Fetches suggestions from `/api/v1/ai/suggested_tasks`
- Manages loading states and error handling
- Provides actions for adding/dismissing suggestions

### `AiTaskCard` (`components/AiTaskCard.tsx`)
Component for displaying AI-generated task suggestions:
- Shows task title, description, and time estimate
- Provides three action buttons (Add to Today, Add for Later, Dismiss)
- Features AI badge and gradient styling

### `FocusModeScreen` (`components/FocusModeScreen.tsx`)
Full-screen focus mode component:
- Displays one task at a time
- Shows progress bar and completion status
- Provides Complete, Snooze, and Skip actions
- Handles task completion and navigation

## API Integration

### Backend Endpoints Used
- `GET /api/v1/tasks?completed=false` - Fetch incomplete tasks
- `POST /api/v1/ai/suggested_tasks` - Get AI task suggestions
- `POST /api/v1/tasks` - Create new tasks (for "Add for Later")
- `PATCH /api/v1/tasks/:id` - Update task completion status

### Data Flow
1. **Load Tasks**: Fetch incomplete tasks on screen mount
2. **AI Suggestions**: User taps "Assist Me" → API call → Display suggestions
3. **Task Selection**: User selects tasks (local state) or adds AI suggestions
4. **Focus Mode**: Selected tasks passed to FocusModeScreen
5. **Task Completion**: Updates sent to backend via PATCH request

## State Management

### Local State
- `selectedTasks`: Array of tasks selected for today's focus
- `isFocusMode`: Boolean controlling focus mode display
- `aiSuggestions`: Array of AI-generated task suggestions

### Global State (via React Query)
- Task data fetched and cached automatically
- Mutations for creating and updating tasks
- Automatic cache invalidation on successful operations

## User Flow

1. **Entry**: User taps "Today's Focus" tab
2. **Task Review**: Views incomplete tasks sorted by priority
3. **AI Assistance**: Taps "Assist Me" to get AI suggestions
4. **Task Selection**: Selects existing tasks or adds AI suggestions
5. **Focus Mode**: Enters immersive focus mode with selected tasks
6. **Task Completion**: Completes tasks one by one with progress tracking
7. **Exit**: Returns to Today's Focus screen with updated progress

## Styling

### Design System Compliance
- **Colors**: Uses app's gradient color palette (deep blue to cyan)
- **Typography**: Follows established text hierarchy
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle elevation for cards and buttons
- **Border Radius**: Rounded corners for modern feel

### Responsive Design
- Adapts to different screen sizes
- Safe area handling for notches and home indicators
- Proper touch targets for mobile interaction

## Error Handling

### Network Errors
- Graceful fallback for API failures
- User-friendly error messages
- Retry mechanisms for failed requests

### State Errors
- Validation for required data
- Fallback UI for missing information
- Loading states for better UX

## Performance Considerations

### Optimization
- Efficient re-renders with proper state management
- Lazy loading of AI suggestions
- Optimistic updates for better perceived performance

### Memory Management
- Proper cleanup of event listeners
- Efficient component unmounting
- Minimal memory footprint for focus mode

## Future Enhancements

### Potential Features
- **Pomodoro Timer**: Built-in timer for focused work sessions
- **Task Categories**: Group tasks by project or context
- **Analytics**: Track focus session metrics and productivity
- **Offline Support**: Work without internet connection
- **Customization**: User preferences for focus mode settings 
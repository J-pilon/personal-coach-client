# Testing Setup for Personal Coach App

This directory contains comprehensive unit tests for the React Native Expo app using Jest + React Native Testing Library.

## Test Structure

```
__tests__/
├── hooks/
│   └── useTasks.test.ts          # Tests for custom hooks
├── screens/
│   ├── HomeScreen.test.tsx       # Tests for main task list screen
│   ├── AddTaskScreen.test.tsx    # Tests for task creation screen
│   └── TaskDetailScreen.test.tsx # Tests for task detail/edit screen
├── utils/
│   └── test-utils.tsx            # Custom render function with providers
└── README.md                     # This file
```

## Critical User Flows Tested

### 1. Task Creation Flow
- ✅ Form validation (required fields)
- ✅ Category selection (do/defer/delegate)
- ✅ API integration with error handling
- ✅ Navigation on success
- ✅ Loading states and disabled inputs

### 2. Task Completion Flow
- ✅ Toggle task completion status
- ✅ Visual feedback (checkbox states)
- ✅ API integration with error handling
- ✅ Real-time UI updates

### 3. Task Deletion Flow
- ✅ Confirmation dialog
- ✅ API integration with error handling
- ✅ Navigation on success
- ✅ Loading states

### 4. Task Editing Flow
- ✅ Enter/exit edit mode
- ✅ Form validation
- ✅ Category changes
- ✅ API integration with success/error handling
- ✅ Loading states

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native jest-expo msw
   ```

2. **Run Tests**
   ```bash
   # Run all tests
   npm test
   
   # Run tests in watch mode
   npm run test:watch
   
   # Run tests with coverage
   npm run test:coverage
   
   # Run tests for CI
   npm run test:ci
   ```

## Test Utilities

### Custom Render Function
The `test-utils.tsx` file provides a custom render function that wraps components with necessary providers:
- React Query QueryClient
- Any other context providers your app needs

### Mocking Strategy
- **API Calls**: Mocked using Jest mocks for `@/api/tasks`
- **Navigation**: Mocked using Jest mocks for `expo-router`
- **React Native APIs**: Mocked as needed (Alert, etc.)

## Adding TestIDs

To make the tests more robust, add `testID` props to your components:

```tsx
// In your components
<Pressable 
  testID="task-checkbox"
  onPress={() => handleToggle(task.id!, !task.completed)}
>
  {/* checkbox content */}
</Pressable>

<Pressable 
  testID="task-edit-icon"
  onPress={() => router.push(`/taskDetail/${task.id}`)}
>
  <FontAwesome name="edit" size={16} color="#708090" />
</Pressable>
```

## Best Practices

1. **Test Critical User Flows**: Focus on the main user journeys
2. **Mock External Dependencies**: Don't test third-party libraries
3. **Test Error States**: Ensure your app handles errors gracefully
4. **Test Loading States**: Verify loading indicators work correctly
5. **Use Descriptive Test Names**: Make it clear what each test verifies

## Coverage Goals

- **Hooks**: 100% coverage for custom hooks
- **Screens**: 90%+ coverage for main user flows
- **Components**: 80%+ coverage for reusable components

## Troubleshooting

### Common Issues

1. **Module Resolution Errors**: Ensure Jest config has correct module mapping
2. **TypeScript Errors**: Install `@types/jest` for TypeScript support
3. **React Native Mock Issues**: Use `jest-expo` preset for proper mocking

### Debugging Tests

```bash
# Run specific test file
npm test -- HomeScreen.test.tsx

# Run tests with verbose output
npm test -- --verbose

# Run tests with coverage for specific file
npm test -- --coverage --testPathPattern=HomeScreen
```

## Future Enhancements

1. **Integration Tests**: Test complete user workflows
2. **E2E Tests**: Use Detox for end-to-end testing
3. **Visual Regression Tests**: Test UI consistency
4. **Performance Tests**: Test app performance under load 
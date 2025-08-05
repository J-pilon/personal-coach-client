# AI API Integration

This document describes how to use the AI API endpoints and custom hooks for integrating AI functionality into the client application.

## Overview

The AI integration provides endpoints for:
- Creating SMART goals via AI
- Prioritizing tasks via AI
- Processing general AI requests

## API Endpoints

### Base Configuration

The API base URL is configured in `client/api/ai.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

### Authentication

The API uses JWT token authentication via the `Authorization` header. The user ID is extracted from the JWT token on the server side.

## API Functions

### `aiApi.processAiRequest(params: AiRequestParams)`

Process any AI request with the given input.

**Parameters:**
- `params.input` (string): The user's input text

**Returns:**
- `Promise<ApiResponse<AiResponse>>`

**Example:**
```typescript
const response = await aiApi.processAiRequest({ 
  input: "Create a goal to exercise more" 
});
```

### `aiApi.createSmartGoal(input: string)`

Convenience function for creating SMART goals.

**Parameters:**
- `input` (string): The goal description

**Returns:**
- `Promise<ApiResponse<AiResponse>>`

**Example:**
```typescript
const response = await aiApi.createSmartGoal("I want to learn Spanish");
```

### `aiApi.prioritizeTasks(input: string)`

Convenience function for prioritizing tasks.

**Parameters:**
- `input` (string): The tasks to prioritize

**Returns:**
- `Promise<ApiResponse<AiResponse>>`

**Example:**
```typescript
const response = await aiApi.prioritizeTasks("Prioritize: exercise, work, sleep");
```

## Response Types

### `AiResponse`

```typescript
interface AiResponse {
  intent: 'smart_goal' | 'prioritization' | 'error';
  response: any; // Varies based on intent
  context_used: boolean;
  request_id: number;
}
```

### `SmartGoalResponse`

```typescript
interface SmartGoalResponse {
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  time_bound?: string;
}
```

### `PrioritizationResponse`

```typescript
interface PrioritizationItem {
  task: string;
  priority: number;
  rationale?: string;
  recommended_action?: string;
}

interface PrioritizationResponse extends Array<PrioritizationItem> {}
```

## Custom Hooks

### `useAiRequest()`

General-purpose hook for processing AI requests.

**Returns:**
- `useMutation` object with loading, error, and success states

**Example:**
```typescript
const aiRequest = useAiRequest();

const handleSubmit = async () => {
  try {
    const result = await aiRequest.mutateAsync({ 
      input: "Create a goal to exercise more" 
    });
    console.log('AI Response:', result);
  } catch (error) {
    console.error('AI Error:', error);
  }
};
```

### `useCreateSmartGoal()`

Specialized hook for creating SMART goals.

**Returns:**
- `useMutation` object

**Example:**
```typescript
const createGoal = useCreateSmartGoal();

const handleCreateGoal = async () => {
  try {
    const result = await createGoal.mutateAsync("I want to learn Spanish");
    console.log('Goal created:', result);
  } catch (error) {
    console.error('Error creating goal:', error);
  }
};
```

### `usePrioritizeTasks()`

Specialized hook for prioritizing tasks.

**Returns:**
- `useMutation` object

**Example:**
```typescript
const prioritizeTasks = usePrioritizeTasks();

const handlePrioritize = async () => {
  try {
    const result = await prioritizeTasks.mutateAsync("exercise, work, sleep");
    console.log('Tasks prioritized:', result);
  } catch (error) {
    console.error('Error prioritizing tasks:', error);
  }
};
```

### `useAiResponseHelpers()`

Utility hook providing helper functions for working with AI responses.

**Returns:**
- Object with helper functions:
  - `isSmartGoalResponse(response)`: Type guard for smart goal responses
  - `isPrioritizationResponse(response)`: Type guard for prioritization responses
  - `isErrorResponse(response)`: Type guard for error responses
  - `formatSmartGoalResponse(response)`: Formats smart goal response as string
  - `formatPrioritizationResponse(response)`: Formats prioritization response as string

**Example:**
```typescript
const { isSmartGoalResponse, formatSmartGoalResponse } = useAiResponseHelpers();

const renderResponse = (response: AiResponse) => {
  if (isSmartGoalResponse(response)) {
    return <Text>{formatSmartGoalResponse(response.response)}</Text>;
  }
  // Handle other response types...
};
```

## Example Component

See `client/components/AiAssistant.tsx` for a complete example of how to use the AI hooks in a React Native component.

## Error Handling

All hooks and API functions include proper error handling:

1. **Network errors**: Caught and converted to user-friendly messages
2. **API errors**: Server error responses are properly handled
3. **Validation errors**: Input validation with appropriate error messages
4. **Type safety**: TypeScript interfaces ensure type safety

## Integration with React Query

The hooks use React Query for:
- **Caching**: Responses are cached appropriately
- **Background updates**: Automatic refetching when needed
- **Optimistic updates**: UI updates before server confirmation
- **Error retry**: Automatic retry on network failures

## Future Enhancements

Planned features:
- AI request history tracking
- Request caching and deduplication
- Real-time streaming responses
- Custom prompt templates
- User preference learning

## Troubleshooting

### Common Issues

1. **Authentication errors**: Ensure JWT token is valid and included in Authorization header
2. **Network errors**: Check if the Rails server is running on port 3000
3. **Type errors**: Ensure all TypeScript interfaces are properly imported
4. **Response parsing errors**: Check server response format matches expected interfaces

### Debug Mode

Enable debug logging by checking the browser console for detailed API request/response information. 
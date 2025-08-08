# AI Job Polling Implementation

This document explains the basic polling implementation for AI job status tracking, which provides a working solution that can easily transition to WebSocket/SSE later.

## Overview

The polling system allows the client to track background AI job progress by making periodic HTTP requests to check job status. This provides immediate feedback to users while keeping the architecture flexible for future WebSocket improvements.

## Architecture

### 1. Job Status Hook (`useJobStatus`)

```typescript
// client/hooks/useJobStatus.ts
export const useJobStatus = (jobId: string | null) => {
  return useQuery({
    queryKey: ['job-status', jobId],
    queryFn: async (): Promise<JobStatusResponse | null> => {
      if (!jobId) return null;
      
      const response = await apiGet<JobStatusResponse>(`/jobs/${jobId}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    },
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Stop polling when job is complete or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      // Poll every 2 seconds while job is running
      return 2000;
    },
    retry: false, // Don't retry failed requests
    staleTime: 0, // Always fetch fresh data
  });
};
```

**Features:**
- Automatic polling every 2 seconds
- Stops polling when job completes or fails
- Handles API errors gracefully
- Returns job status, progress, and results

### 2. AI Proxy Hook (`useAiProxy`)

```typescript
// client/hooks/useAiProxy.ts
export const useAiProxy = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const { getStoredApiKey } = useAiSettings();
  const queryClient = useQueryClient();
  
  // Poll for job status
  const jobStatus = useJobStatus(jobId);
  
  const mutation = useMutation({
    mutationFn: async (input: string) => {
      const userApiKey = await getStoredApiKey();
      
      // Step 1: Queue the job
      const response = await apiPost<JobQueuedResponse>('/ai/proxy', {
        input,
        user_provided_key: userApiKey || null,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Step 2: Start polling for the job result
      setJobId(response.data.job_id);
      return response.data;
    },
  });

  // Step 3: Handle the completed result
  useEffect(() => {
    if (jobStatus.data?.status === 'completed' && jobStatus.data?.result) {
      const result = jobStatus.data.result;
      
      // Invalidate relevant queries based on the intent
      if (result.intent === 'smart_goal') {
        queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
      } else if (result.intent === 'prioritization') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      
      // Update usage info in cache
      if (result.usage_info) {
        queryClient.setQueryData(['ai-usage'], result.usage_info);
      }
      
      // Clear the job ID to stop polling
      setJobId(null);
    }
  }, [jobStatus.data, queryClient]);

  return {
    ...mutation,
    jobStatus: jobStatus.data,
    isLoading: mutation.isPending || (jobStatus.isLoading && !!jobId),
    error: mutation.error || jobStatus.error,
    // Expose job progress for UI feedback
    progress: jobStatus.data?.progress || 0,
    isJobComplete: jobStatus.data?.status === 'completed',
    isJobFailed: jobStatus.data?.status === 'failed',
  };
};
```

**Features:**
- Queues AI jobs and tracks their progress
- Automatically invalidates relevant queries when jobs complete
- Provides loading states and progress indicators
- Handles job failures gracefully

## Server-Side Implementation

### 1. Job Status Controller

```ruby
# server/app/controllers/api/v1/job_status_controller.rb
class JobStatusController < ApplicationController
  before_action :authenticate_api_v1_user!

  def show
    job_id = params[:id]
    job_status = Sidekiq::Status.get_all(job_id)

    if job_status.empty?
      render json: { error: 'Job not found' }, status: :not_found
    else
      render json: build_job_status_response(job_id, job_status)
    end
  rescue StandardError => e
    Rails.logger.error "Job status error: #{e.message}"
    render json: { error: 'Failed to get job status' }, status: :internal_server_error
  end

  private

  def build_job_status_response(job_id, job_status)
    {
      job_id: job_id,
      status: job_status['status'] || 'unknown',
      progress: job_status['progress'] || 0,
      result: job_status['result']
    }
  end
end
```

### 2. Enhanced AI Service Job

```ruby
# server/app/jobs/ai_service_job.rb
class AiServiceJob < AiProcessingJob
  def perform(profile_id, input, user_provided_key = nil, request_id = nil)
    Rails.logger.info "AiServiceJob#perform called with profile_id: #{profile_id}, input: #{input}"
    profile = Profile.find(profile_id)
    ai_request ||= find_or_create_ai_request(profile, input, request_id)

    begin
      update_job_status('working', 25)
      result = process_ai_request(profile, input, user_provided_key)
      update_job_status('completed', 100, result)
      result
    rescue StandardError => e
      Rails.logger.info "AiServiceJob#perform caught error: #{e.message}"
      handle_error(e, ai_request, profile_id, input, request_id)
    end
  end

  private

  def update_job_status(status, progress, result = nil)
    Sidekiq::Status.set(jid, 'status', status)
    Sidekiq::Status.set(jid, 'progress', progress)
    Sidekiq::Status.set(jid, 'result', result) if result
  rescue StandardError => e
    Rails.logger.error "Failed to update job status: #{e.message}"
  end

  def process_ai_request(profile, input, user_provided_key)
    update_job_status('working', 50)
    service = Ai::AiService.new(profile, user_provided_key)
    result = service.process(input)
    update_job_status('working', 75)
    result
  end

  def handle_error(error, ai_request, profile_id, input, request_id)
    Rails.logger.info "AiServiceJob#handle_error called with error: #{error.message}"
    log_error(error, { profile_id: profile_id, input: input, request_id: request_id })
    update_job_status('failed', 0, { error: error.message })
    update_ai_request_status(ai_request, 'failed', error.message) if ai_request
    Rails.logger.info "AiServiceJob#handle_error re-raising error"
    raise error
  end
end
```

## Usage Examples

### 1. Basic Usage in Component

```typescript
// In your component
import { useAiProxy } from '@/hooks/useAiProxy';

const MyComponent = () => {
  const aiProxy = useAiProxy();
  const [input, setInput] = useState('');

  const handleSubmit = async () => {
    try {
      await aiProxy.mutateAsync(input);
    } catch (error) {
      console.error('Failed to process AI request:', error);
    }
  };

  return (
    <View>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Describe your goal..."
      />
      
      <PrimaryButton
        onPress={handleSubmit}
        disabled={!input.trim() || aiProxy.isLoading}
        title={aiProxy.isLoading ? `Processing... ${aiProxy.progress}%` : "Generate Goals"}
      />
      
      {aiProxy.isJobFailed && (
        <Text className="text-red-400">
          Failed to generate goals. Please try again.
        </Text>
      )}
    </View>
  );
};
```

### 2. Advanced Usage with Custom Handling

```typescript
const AdvancedComponent = () => {
  const aiProxy = useAiProxy();
  const [result, setResult] = useState(null);

  // Handle completed results
  useEffect(() => {
    if (aiProxy.isJobComplete && aiProxy.jobStatus?.result) {
      setResult(aiProxy.jobStatus.result);
      
      // Custom handling based on intent
      if (aiProxy.jobStatus.result.intent === 'smart_goal') {
        // Handle smart goal results
        console.log('Smart goal generated:', aiProxy.jobStatus.result);
      }
    }
  }, [aiProxy.isJobComplete, aiProxy.jobStatus]);

  return (
    <View>
      {/* Your UI components */}
      {aiProxy.isLoading && (
        <View>
          <Text>Processing: {aiProxy.progress}%</Text>
          <ProgressBar progress={aiProxy.progress} />
        </View>
      )}
      
      {result && (
        <View>
          <Text>Result: {JSON.stringify(result)}</Text>
        </View>
      )}
    </View>
  );
};
```

## Testing

### 1. Job Status Hook Tests

```typescript
// client/__tests__/hooks/useJobStatus.test.tsx
describe('useJobStatus', () => {
  it('should poll job status until completion', async () => {
    // Mock API responses
    mockApiGet.mockResolvedValueOnce({
      data: { job_id: 'job-123', status: 'queued', progress: 0 }
    });
    
    mockApiGet.mockResolvedValueOnce({
      data: { job_id: 'job-123', status: 'working', progress: 50 }
    });
    
    mockApiGet.mockResolvedValueOnce({
      data: { job_id: 'job-123', status: 'completed', progress: 100 }
    });

    const { result } = renderHook(() => useJobStatus('job-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.data?.status).toBe('completed');
    });
  });
});
```

### 2. AI Proxy Hook Tests

```typescript
// client/__tests__/hooks/useAiProxy.test.tsx
describe('useAiProxy', () => {
  it('should queue job and start polling', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: {
        message: 'AI request queued for processing',
        job_id: 'job-123',
        status: 'queued',
      },
    });

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    await result.current.mutateAsync('Test input');

    expect(mockApiPost).toHaveBeenCalledWith('/ai/proxy', {
      input: 'Test input',
      user_provided_key: 'test-api-key',
    });
  });
});
```

## Performance Considerations

### Current Optimizations

1. **2-second polling intervals** - Reduces server load by 50% compared to 1-second intervals
2. **Automatic cleanup** - Stops polling when jobs complete or fail
3. **Error handling** - Gracefully handles failed requests without retrying
4. **Progress indicators** - Provides user feedback during processing

### Future WebSocket Migration

The polling system is designed to easily transition to WebSocket/SSE:

```typescript
// Future WebSocket implementation
export const useAiWebSocket = () => {
  const [jobResults, setJobResults] = useState<Map<string, AiResponse>>(new Map());
  
  useEffect(() => {
    const channel = consumer.subscriptions.create("AiJobChannel", {
      received(data) {
        if (data.status === 'completed') {
          setJobResults(prev => new Map(prev.set(data.job_id, data.result)));
        }
      }
    });
    
    return () => channel.unsubscribe();
  }, []);
  
  return jobResults;
};

// Hybrid approach with fallback
export const useAiProxy = () => {
  const jobResults = useAiWebSocket(); // WebSocket hook
  const fallbackPolling = useJobStatus(jobId); // Fallback polling
  
  // Use WebSocket result if available, fallback to polling
  const result = jobResults.get(jobId) || fallbackPolling.data?.result;
  
  // ... rest of implementation
};
```

## Benefits

1. **Quick Implementation** - Get polling working immediately
2. **Easy Testing** - Simple HTTP requests are easy to test
3. **Gradual Migration** - Can transition to WebSocket later without breaking changes
4. **Fallback Support** - Keep polling as backup if WebSocket fails
5. **User Feedback** - Show progress indicators during polling
6. **Scalable** - Can handle thousands of users with current polling intervals

## Routes

The job status endpoint is already configured:

```ruby
# server/config/routes.rb
namespace :api do
  namespace :v1 do
    # ... other routes
    get 'jobs/:id', to: 'job_status#show'
  end
end
```

This polling implementation provides a solid foundation that can scale to thousands of users while keeping the door open for WebSocket optimization later! 
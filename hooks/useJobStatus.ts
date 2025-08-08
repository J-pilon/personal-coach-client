import { apiGet } from '@/utils/apiRequest';
import { useQuery } from '@tanstack/react-query';

interface JobStatusResponse {
  job_id: string;
  status: 'queued' | 'working' | 'complete' | 'failed' | 'unknown';
  progress: number;
  result?: any;
}

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
      // {
//   "gcTime": 300000,
//   "observers": [
//     {
//       "listeners": [Set
//       ],
//       "options": [Object
//       ],
//       "refetch": [Function bound refetch
//       ],
//       "subscribe": [Function bound subscribe
//       ]
//     }
//   ],
//   "options": {
//     "_defaulted": true,
//     "_optimisticResults": "optimistic",
//     "enabled": true,
//     "queryFn": [Function queryFn
//     ],
//     "queryHash": "[\"job-status\",\"665bc788e068dd23a55911b2\"]",
//     "queryKey": [
//       "job-status",
//       "665bc788e068dd23a55911b2"
//     ],
//     "refetchInterval": [Function refetchInterval
//     ],
//     "refetchOnReconnect": true,
//     "retry": false,
//     "staleTime": 0,
//     "throwOnError": false
//   },
//   "queryHash": "[\"job-status\",\"665bc788e068dd23a55911b2\"]",
//   "queryKey": [
//     "job-status",
//     "665bc788e068dd23a55911b2"
//   ],
//   "state": {
//     "data": {
//       "job_id": "665bc788e068dd23a55911b2",
//       "message": null,
//       "progress": 0,
//       "result": null,
//       "status": "complete",
//       "updated_at": null
//     },
//     "dataUpdateCount": 22,
//     "dataUpdatedAt": 1754540856044,
//     "error": null,
//     "errorUpdateCount": 0,
//     "errorUpdatedAt": 0,
//     "fetchFailureCount": 0,
//     "fetchFailureReason": null,
//     "fetchMeta": null,
//     "fetchStatus": "fetching",
//     "isInvalidated": false,
//     "status": "success"
//   }
// }
      if (data?.state?.data?.status === 'complete' || data?.state?.data?.status === 'failed') {
        return false;
      }
      return 2000;
    },
    retry: false,
    staleTime: 0,
  });
}; 
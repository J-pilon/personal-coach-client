import { apiRequest } from '@/utils/apiRequest';

export interface TicketData {
  kind: 'bug' | 'feedback';
  title: string;
  description: string;
  source: 'app';
}

export interface DiagnosticsData {
  app_version?: string;
  build_number?: string;
  device_model?: string;
  os_version?: string;
  locale?: string;
  timezone?: string;
  network_state?: string;
  user_id?: string;
}

export interface TicketResponse {
  id: number;
  kind: string;
  title: string;
  description: string;
  source: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const createTicket = async (
  ticketData: TicketData,
  diagnostics?: DiagnosticsData
): Promise<TicketResponse> => {
  const payload = {
    ticket: ticketData,
    ...diagnostics
  };

  return apiRequest<TicketResponse>('/tickets', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const getTicket = async (ticketId: number): Promise<TicketResponse> => {
  return apiRequest<TicketResponse>(`/tickets/${ticketId}`, {
    method: 'GET'
  });
}; 
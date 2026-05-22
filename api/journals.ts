// API client for Rails server journal + journal_entries endpoints.
// The server resolves "the default journal" itself, so clients never
// supply profile_id or journal_id on writes.
import { apiDelete, apiGet, apiPost, apiPut, type ApiResponse } from '../utils/apiRequest';
import type { JournalEntryType } from '../models/journal';

export interface Journal {
  id: number;
  title: string;
  description?: string | null;
  kind: 'default';
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry {
  id: number;
  journal_id: number;
  profile_id: number;
  title?: string | null;
  body: string;
  entry_type: JournalEntryType;
  occurred_on: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateJournalEntryParams {
  title: string;
  body: string;
  entry_type: JournalEntryType;
  occurred_on: string;
}

export interface UpdateJournalEntryParams {
  title?: string | null;
  body?: string;
  entry_type?: JournalEntryType;
  occurred_on?: string;
}

export interface JournalEntryFilters {
  entry_type?: JournalEntryType;
  occurred_on?: string;
  start_date?: string;
  end_date?: string;
}

export class JournalsAPI {
  async getJournal(): Promise<ApiResponse<Journal>> {
    return apiGet<Journal>('/journal');
  }

  async getEntries(filters: JournalEntryFilters = {}): Promise<ApiResponse<JournalEntry[]>> {
    const params: Record<string, string> = {};
    if (filters.entry_type) params.entry_type = filters.entry_type;
    if (filters.occurred_on) params.occurred_on = filters.occurred_on;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    return apiGet<JournalEntry[]>('/journal/journal_entries', params);
  }

  async getEntry(id: number): Promise<ApiResponse<JournalEntry>> {
    return apiGet<JournalEntry>(`/journal/journal_entries/${id}`);
  }

  async createEntry(params: CreateJournalEntryParams): Promise<ApiResponse<JournalEntry>> {
    return apiPost<JournalEntry>('/journal/journal_entries', { journal_entry: params });
  }

  async updateEntry(id: number, params: UpdateJournalEntryParams): Promise<ApiResponse<JournalEntry>> {
    return apiPut<JournalEntry>(`/journal/journal_entries/${id}`, { journal_entry: params });
  }

  async deleteEntry(id: number): Promise<ApiResponse<void>> {
    return apiDelete<void>(`/journal/journal_entries/${id}`);
  }
}

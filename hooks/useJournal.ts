import {
  CreateJournalEntryParams,
  Journal,
  JournalEntry,
  JournalEntryFilters,
  JournalsAPI,
  UpdateJournalEntryParams,
} from '@/api/journals';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const journalsApi = new JournalsAPI();

const entriesQueryKey = (filters?: JournalEntryFilters) =>
  filters && Object.keys(filters).length > 0
    ? (['journalEntries', filters] as const)
    : (['journalEntries'] as const);

export const useJournal = () => {
  return useQuery<Journal>({
    queryKey: ['journal'],
    queryFn: async () => {
      const response = await journalsApi.getJournal();
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('Journal response was empty');
      }
      return response.data;
    },
    retry: 2,
  });
};

export const useJournalEntries = (filters: JournalEntryFilters = {}) => {
  return useQuery<JournalEntry[]>({
    queryKey: entriesQueryKey(filters),
    queryFn: async () => {
      const response = await journalsApi.getEntries(filters);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    retry: 2,
  });
};

export const useJournalEntry = (id: number) => {
  return useQuery<JournalEntry | undefined>({
    queryKey: ['journalEntry', id],
    queryFn: async () => {
      const response = await journalsApi.getEntry(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: id > 0,
    retry: 2,
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateJournalEntryParams) => {
      const response = await journalsApi.createEntry(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
};

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, params }: { id: number; params: UpdateJournalEntryParams }) => {
      const response = await journalsApi.updateEntry(id, params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['journalEntry', variables.id] });
    },
  });
};

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await journalsApi.deleteEntry(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });
};

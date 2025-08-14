import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Quote, QUOTE_QUERY_KEYS } from '@/api/generated/Quote';

const quoteApi = new Quote();

export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      await quoteApi.quoteControllerDeleteQuote(quoteId);
      return quoteId;
    },
    onSuccess: (quoteId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.removeQueries({ queryKey: ['quotes', quoteId] });
    },
    onError: (error) => {
      console.error('Error deleting quote:', error);
    },
  });
} 
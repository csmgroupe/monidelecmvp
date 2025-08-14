import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Quote, QUOTE_QUERY_KEYS } from '@/api/generated/Quote';
import { UpdateQuoteDtoContract } from '@/api/generated/data-contracts';

const quoteApi = new Quote();

export function useUpdateQuote(quoteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateQuoteDtoContract) => {
      return await quoteApi.quoteControllerUpdateQuote(quoteId, data);
    },
    onSuccess: (data) => {
      // Mise à jour optimiste du cache au lieu d'invalidation
      queryClient.setQueryData(
        [QUOTE_QUERY_KEYS.controllerGetQuotesByProjectId, data.projectId],
        (oldData: any) => {
          if (!oldData) return [data];
          return oldData.map((quote: any) => 
            quote.id === quoteId ? { ...quote, ...data } : quote
          );
        }
      );
      
      // Invalidation sélective seulement pour les requêtes générales
      queryClient.invalidateQueries({ 
        queryKey: ['quotes'], 
        exact: false,
        refetchType: 'none' // Ne pas déclencher de refetch automatique
      });
    },
    onError: (error) => {
      console.error('Error updating quote:', error);
    },
  });
} 
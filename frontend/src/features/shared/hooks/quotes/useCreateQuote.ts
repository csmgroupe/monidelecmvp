import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Quote, QUOTE_QUERY_KEYS } from '@/api/generated/Quote';
import { CreateQuoteDtoContract } from '@/api/generated/data-contracts';

const quoteApi = new Quote();

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuoteDtoContract) => {
      return await quoteApi.quoteControllerCreateQuote(data);
    },
    onSuccess: (data) => {
      // Mise à jour optimiste du cache au lieu d'invalidation
      queryClient.setQueryData(
        [QUOTE_QUERY_KEYS.controllerGetQuotesByProjectId, data.projectId],
        (oldData: any) => {
          if (!oldData) return [data];
          return [...oldData, data];
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
      console.error('Error creating quote:', error);
    },
  });
} 
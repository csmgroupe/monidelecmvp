import { useQuery } from '@tanstack/react-query';
import { Quote, QUOTE_QUERY_KEYS } from '@/api/generated/Quote';

const quoteApi = new Quote();

export function useQuotesByProject(projectId: string) {
  return useQuery({
    queryKey: [QUOTE_QUERY_KEYS.controllerGetQuotesByProjectId, projectId],
    queryFn: async () => {
      return await quoteApi.quoteControllerGetQuotesByProjectId(projectId);
    },
    enabled: !!projectId,
    staleTime: 30 * 1000, // Réduit à 30 secondes pour des données plus fraîches
    gcTime: 5 * 60 * 1000, // Garde en cache pendant 5 minutes
    refetchOnWindowFocus: true, // Recharger quand on refocus la fenêtre
    refetchOnMount: true, // Recharger au mount pour avoir les dernières données
    refetchOnReconnect: true, // Recharger à la reconnexion
    retry: 2, // Augmenter les tentatives de retry
  });
} 
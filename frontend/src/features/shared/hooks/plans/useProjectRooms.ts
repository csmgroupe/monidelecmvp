import { useQuery } from '@tanstack/react-query';

export function useProjectRooms(projectId?: string) {
  return useQuery({
    queryKey: ['projectRooms', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return null;
      const res = await fetch(`/api/v1/projects/${projectId}/rooms`);
      if (!res.ok) throw new Error('Erreur chargement rooms');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
} 
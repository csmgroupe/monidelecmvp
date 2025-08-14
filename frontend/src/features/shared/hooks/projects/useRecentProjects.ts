import { useAppDispatch } from '@/store/reduxStore';
import { loadProjects } from '@/modules/abplan/projects/application/use-cases/load-projects';
import { PROJECT_QUERY_KEYS } from '@/api/generated/Project';
import { useQuery } from '@tanstack/react-query';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';

interface PaginatedProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  totalPages: number;
}

export const useRecentProjects = () => {
  const dispatch = useAppDispatch();

  return useQuery<PaginatedProjectsResponse>({
    queryKey: [PROJECT_QUERY_KEYS.controllerFindAll, 'recent', 1, 5],
    queryFn: async () => {
      const result = await dispatch(loadProjects({ page: 1, limit: 5 }));
      return result as PaginatedProjectsResponse;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - plus fréquent pour le dashboard
  });
}; 
import { useAppDispatch } from '@/store/reduxStore';
import { loadProjects } from '@/modules/abplan/projects/application/use-cases/load-projects';
import { PROJECT_QUERY_KEYS } from '@/api/generated/Project';
import { useQuery } from '@tanstack/react-query';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';

interface UseLoadProjectsParams {
  page?: number;
  limit?: number;
}

interface PaginatedProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  totalPages: number;
}

export const useLoadProjects = (params: UseLoadProjectsParams = {}) => {
  const dispatch = useAppDispatch();
  const { page = 1, limit = 10 } = params;

  return useQuery<PaginatedProjectsResponse>({
    queryKey: [PROJECT_QUERY_KEYS.controllerFindAll, page, limit],
    queryFn: async () => {
      const result = await dispatch(loadProjects({ page, limit }));
      return result as PaginatedProjectsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 
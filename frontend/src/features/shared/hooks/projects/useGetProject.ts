import { useQuery } from '@tanstack/react-query';
import { PROJECT_QUERY_KEYS } from '@/api/generated/Project';
import { ProjectsProvider } from '@/modules/abplan/projects/infrastructure/ProjectsProvider';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';

export const useGetProject = (projectId: string | undefined, options?: { enabled?: boolean }) => {
  const projectsProvider = new ProjectsProvider();

  return useQuery<Project>({
    queryKey: [PROJECT_QUERY_KEYS.controllerFindOne, projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      return await projectsProvider.getProject(projectId);
    },
    enabled: !!projectId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
}; 
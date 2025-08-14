import { ProjectCard } from '@/features/shared/components/ProjectCard';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';

interface RecentProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const RecentProjectCard = ({ project, onClick }: RecentProjectCardProps) => {
  return (
    <ProjectCard
      project={project}
      onClick={onClick}
      showDeleteButton={false}
      variant="home"
    />
  );
}; 
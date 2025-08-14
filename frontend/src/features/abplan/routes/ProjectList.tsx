import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, History, Loader2 } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { useAppSelector } from '@/store/reduxStore';
import { selectDraftProjects, selectCompletedProjects } from '@/modules/abplan/projects/application/projects.selectors';
import { useLoadProjects } from '@/features/shared/hooks/projects/useLoadProjects';
import { PATHS } from '@/config/paths';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';
import { ProjectCard } from '@/features/shared/components/ProjectCard';

export function ProjectList() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  const user = useAppSelector(state => state.auth.user);
  const draftProjects = useAppSelector(selectDraftProjects);
  const completedProjects = useAppSelector(selectCompletedProjects);

  const { isLoading: isLoadingProjects, refetch, data: projectsData } = useLoadProjects({ 
    page: currentPage, 
    limit: pageSize 
  });

  const handleNewProject = useCallback(() => {
    navigate(PATHS.abplan.new);
  }, [navigate]);

  const handleCompletedProject = useCallback((project: Project) => {
    if (project.id) {
      navigate(PATHS.abplan.steps.summary(project.id));
    }
  }, [navigate]);

  const handleProjectClick = useCallback((project: Project) => {
    if (project.id) {
      if (project.status === 'completed') {
        navigate(PATHS.abplan.steps.quote(project.id));
      } else {
        navigate(PATHS.abplan.steps.info(project.id));
      }
    }
  }, [navigate]);

  // Combine and sort all projects by updated date
  const allProjects = [...draftProjects, ...completedProjects].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  return (
    <>
      <div className="mx-auto p-6">
        {/* <DisclaimerBanner /> */}
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Mes projets</h2>
            <button
              onClick={handleNewProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau projet
            </button>
          </div>

          {/* All Projects */}
          {allProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project)}
                  showDeleteButton={true}
                  variant="projects"
                  onDelete={refetch}
                />
              ))}
            </div>
          ) : !isLoadingProjects ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <History className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet</h3>
              <p className="text-gray-600 mb-6">Créez votre premier projet pour commencer.</p>
              <button
                onClick={handleNewProject}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer un projet
              </button>
            </div>
          ) : null}

          {/* Loading State */}
          {isLoadingProjects && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-gray-600">Chargement des projets...</p>
            </div>
          )}

          {/* Pagination */}
          {projectsData && projectsData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} sur {projectsData.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= projectsData.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 
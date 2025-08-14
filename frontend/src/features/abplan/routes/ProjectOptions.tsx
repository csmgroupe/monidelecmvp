import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStepLayout } from '../components/shared/ProjectStepLayout';
import { StepOptions } from '../components/StepOptions';
import { PATHS } from '@/config/paths';
import { useCurrentProject } from '@/features/shared/hooks/projects/useCurrentProject';

export function ProjectOptions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    currentProject, 
    updateCurrentProject, 
    isLoading: isLoadingProject 
  } = useCurrentProject(id);

  const handleNext = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.summary(id));
    }
  }, [id, navigate, currentProject]);

  const handlePrevious = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.equipment(id));
    }
  }, [id, navigate]);

  if (!id) {
    return (
      <>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-red-600">ID de projet manquant</p>
          </div>
        </div>
      </>
    );
  }

  // Show loading state while fetching project data
  if (isLoadingProject) {
    return (
      <>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Chargement du projet...</p>
            <p className="text-gray-500 text-sm mt-2">Veuillez patienter pendant le chargement des données</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ProjectStepLayout
        currentStep={5}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isLoading={false}
      >
        <StepOptions
          onNext={handleNext}
          onPrevious={handlePrevious}
          projectData={currentProject || { id: id }}
          setProjectData={updateCurrentProject}
        />
      </ProjectStepLayout>
    </>
  );
} 
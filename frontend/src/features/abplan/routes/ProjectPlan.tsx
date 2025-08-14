import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStepLayout } from '../components/shared/ProjectStepLayout';
import { StepUpload } from '../components/StepUpload';
import { PATHS } from '@/config/paths';
import { useCurrentProject } from '@/features/shared/hooks/projects/useCurrentProject';

export function ProjectPlan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    currentProject, 
    updateCurrentProject, 
    isLoading: isLoadingProject 
  } = useCurrentProject(id);

  const handleNext = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.rooms(id));
    }
  }, [id, navigate]);

  const handlePrevious = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.info(id));
    }
  }, [id, navigate]);

  const handleBackToList = useCallback(() => {
    navigate(PATHS.abplan.list);
  }, [navigate]);

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

  const hasPlans = currentProject?.planFiles && currentProject.planFiles.length > 0;

  return (
    <>
      <ProjectStepLayout
        currentStep={2}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isLoading={false}
        nextDisabled={!hasPlans}
      >
        <StepUpload
          onNext={handleNext}
          onPrevious={handlePrevious}
          projectData={currentProject || { id: id }}
          setProjectData={updateCurrentProject}
        />
      </ProjectStepLayout>
    </>
  );
} 
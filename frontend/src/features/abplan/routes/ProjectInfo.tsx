import { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStepLayout } from '../components/shared/ProjectStepLayout';
import { StepProjectInfo } from '../components/StepProjectInfo';
import { PATHS } from '@/config/paths';
import { useCreateProject } from '@/features/shared/hooks/projects/useCreateProject';
import { useUpdateProject } from '@/features/shared/hooks/projects/useUpdateProject';
import { useCurrentProject } from '@/features/shared/hooks/projects/useCurrentProject';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';

export function ProjectInfo() {
  const { id: routeId } = useParams<{ id: string }>();
  const id = routeId || (window.location.pathname === '/projects/new' ? 'new' : routeId);
  
  console.log('[ProjectInfo] Component loaded with routeId:', routeId, 'computed id:', id);  
  const navigate = useNavigate();
  
  const { 
    currentProject, 
    updateCurrentProject, 
    setCurrentProject, 
    isNewProject, 
    isLoading: isLoadingProject,
    hasTempChanges,
    clearTempProject
  } = useCurrentProject(id);

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject(id);

  // Initialize project data for new projects
  useEffect(() => {
    if (isNewProject && !currentProject) {
      setCurrentProject(null);
    }
  }, [isNewProject, currentProject, setCurrentProject]);

  const handleNext = useCallback(() => {
    // Validate form first
    const validateFunction = (window as any).validateProjectForm;
    if (validateFunction && !validateFunction()) {
      return; // Stop if validation fails
    }

    if (!currentProject?.name) {
      return;
    }

    const projectFields = {
      name: currentProject.name,
      description: currentProject.description,
      typeProjet: currentProject.typeProjet,
      typeTravaux: currentProject.typeTravaux,
      codePostal: currentProject.codePostal,
      numberOfPeople: currentProject.numberOfPeople,
    };

    if (currentProject?.id && !isNewProject) {
      // Update existing project
      updateProjectMutation.mutate({
        projectId: currentProject.id,
        data: projectFields
      }, {
        onSuccess: (updatedProject) => {
          navigate(PATHS.abplan.steps.plan(updatedProject.id));
        }
      });
    } else {
      // Create new project
      createProjectMutation.mutate(projectFields, {
        onSuccess: (project) => {
          if (project && typeof project === 'object' && 'id' in project) {
            const createdProject = project as Project;
            // Update the current project with the new ID
            setCurrentProject(createdProject);
            navigate(PATHS.abplan.steps.plan(createdProject.id));
          }
        }
      });
    }
  }, [currentProject, createProjectMutation, updateProjectMutation, navigate, isNewProject, setCurrentProject]);

  // Show loading state while fetching project data
  if (isLoadingProject && !isNewProject) {
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

  const isFormLoading = createProjectMutation.isPending || updateProjectMutation.isPending;

  return (
    <>
      <ProjectStepLayout
        currentStep={1}
        onNext={handleNext}
        isLoading={isFormLoading}
        nextDisabled={!currentProject?.name || !currentProject?.typeProjet || !currentProject?.typeTravaux || !currentProject?.codePostal || !currentProject?.numberOfPeople || currentProject.numberOfPeople < 1 || isFormLoading}
      > 
        <StepProjectInfo
          onNext={handleNext}
          projectData={currentProject || { 
            name: '', 
            description: '', 
            typeProjet: undefined, 
            typeTravaux: undefined, 
            codePostal: '' 
          }}
          setProjectData={updateCurrentProject}
          isLoading={isFormLoading}
        />
      </ProjectStepLayout>
    </>
  );
} 
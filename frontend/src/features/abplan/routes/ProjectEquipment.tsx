import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStepLayout } from '../components/shared/ProjectStepLayout';
import { StepEquipments } from '../components/StepEquipments';
import { PATHS } from '@/config/paths';
import { useCurrentProject } from '@/features/shared/hooks/projects/useCurrentProject';
import { useProjectRooms } from '@/features/shared/hooks/project-rooms/useProjectRooms';
import { useProjectEquipments } from '@/features/shared/hooks/project-equipments/useProjectEquipments';

export function ProjectEquipment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    currentProject, 
    updateCurrentProject, 
    isLoading: isLoadingProject 
  } = useCurrentProject(id);

  // Load project rooms for equipment step
  const { data: projectRooms, isLoading: isLoadingRooms } = useProjectRooms(id || '');
  
  // Load project equipments for equipment step
  const { data: projectEquipments, isLoading: isLoadingEquipments } = useProjectEquipments(id || '');

  const handleNext = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.options(id));
    }
  }, [id, navigate]);

  const handlePrevious = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.rooms(id));
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
  if (isLoadingProject || isLoadingRooms || isLoadingEquipments) {
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

  // Prepare project data with rooms and equipments for the StepEquipments component
  const projectDataWithRoomsAndEquipments = {
    ...(currentProject || { id: id }),
    pieces: projectRooms?.rooms || [],
    rooms: projectRooms?.rooms || [],
    surface_loi_carrez: projectRooms?.surfaceLoiCarrez,
    equipments: (projectEquipments?.equipments || []) as any,
  };

  return (
    <>
      <ProjectStepLayout
        currentStep={4}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isLoading={false}
      >
        <StepEquipments
          onNext={handleNext}
          onPrevious={handlePrevious}
          projectData={projectDataWithRoomsAndEquipments}
          setProjectData={updateCurrentProject}
        />
      </ProjectStepLayout>
    </>
  );
} 
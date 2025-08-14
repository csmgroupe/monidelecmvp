import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStepLayout } from '../components/shared/ProjectStepLayout';
import { StepDimensioning } from '../components/StepDimensioning';
import { PATHS } from '@/config/paths';
import { useCurrentProject } from '@/features/shared/hooks/projects/useCurrentProject';
import { useProjectRooms } from '@/features/shared/hooks/project-rooms/useProjectRooms';
import { useProjectEquipments } from '@/features/shared/hooks/project-equipments/useProjectEquipments';

export function ProjectDimensioning() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentProject,
    updateCurrentProject,
    isLoading: isLoadingProject,
  } = useCurrentProject(id);

  // Load project rooms for dimensioning calculation
  const { data: projectRooms, isLoading: isLoadingRooms } = useProjectRooms(id || '');
  
  // Load project equipments for dimensioning calculation
  const { data: projectEquipments, isLoading: isLoadingEquipments } = useProjectEquipments(id || '');

  const handleNext = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.quote(id));
    }
  }, [id, navigate]);

  const handlePrevious = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.summary(id));
    }
  }, [id, navigate]);

  // Track whether the StepDimensioning component is performing its calculation so that we can
  // hide the navigation buttons in the layout. The state is updated via a callback passed down
  // to the step component.
  const [isCalculating, setIsCalculating] = useState(false);

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

  // Prepare project data with rooms and equipments for the StepDimensioning component
  const projectDataWithRooms = {
    ...(currentProject || { id: id }),
    pieces: projectRooms?.rooms || [],
    rooms: projectRooms?.rooms || [],
    surface_loi_carrez: projectRooms?.surfaceLoiCarrez,
    equipments: (projectEquipments?.equipments || []) as any,
  };

  return (
    <>
      <ProjectStepLayout
        currentStep={7}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isLoading={isCalculating}
      >
        <StepDimensioning
          onNext={handleNext}
          onPrevious={handlePrevious}
          projectData={projectDataWithRooms}
          setProjectData={updateCurrentProject}
          onLoadingChange={setIsCalculating}
        />
      </ProjectStepLayout>
    </>
  );
} 
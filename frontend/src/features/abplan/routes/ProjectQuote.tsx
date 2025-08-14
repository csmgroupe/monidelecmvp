import { useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStepLayout } from '../components/shared/ProjectStepLayout';
import { StepQuote, StepQuoteRef } from '../components/StepQuote';
import { PATHS } from '@/config/paths';
import { useCurrentProject } from '@/features/shared/hooks/projects/useCurrentProject';
import { useProjectEquipments } from '@/features/shared/hooks/project-equipments/useProjectEquipments';
import { useProjectRooms } from '@/features/shared/hooks/project-rooms/useProjectRooms';
import { useUpdateProject } from '@/features/shared/hooks/projects/useUpdateProject';
import type { UpdateProjectDto } from '@/modules/abplan/projects/domain/project.entity';

export function ProjectQuote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stepQuoteRef = useRef<StepQuoteRef>(null);
  
  const { 
    currentProject, 
    updateCurrentProject, 
    isLoading: isLoadingProject 
  } = useCurrentProject(id);

  // Load project rooms for quote display
  const { data: projectRooms, isLoading: isLoadingRooms } = useProjectRooms(id || '');
  
  // Load project equipments for quote display
  const { data: projectEquipments, isLoading: isLoadingEquipments } = useProjectEquipments(id || '');

  // Hook pour mettre à jour le projet
  const updateProjectMutation = useUpdateProject(id);

  const handleNext = useCallback(async () => {
    if (!currentProject?.id) {
      console.error('Projet non trouvé');
      navigate(PATHS.abplan.list);
      return;
    }

    try {
      if (stepQuoteRef.current) {
        await stepQuoteRef.current.finishQuote();
      }

      const updateData: UpdateProjectDto = {
        name: currentProject.name,
        description: currentProject.description,
        typeProjet: currentProject.typeProjet,
        typeTravaux: currentProject.typeTravaux,
        codePostal: currentProject.codePostal,
        numberOfPeople: currentProject.numberOfPeople,
        status: 'completed'
      };

      await updateProjectMutation.mutateAsync({
        projectId: currentProject.id,
        data: updateData as any // Temporaire pour la compatibilité avec l'API générée
      });

      console.log('Projet marqué comme terminé');
      
      // 3. Mettre à jour le projet local pour refléter le changement
      updateCurrentProject({
        ...currentProject,
        status: 'completed'
      });
      
      // 4. Retourner à la liste des projets
      navigate(PATHS.abplan.list);
      
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      navigate(PATHS.abplan.list);
    }
  }, [currentProject, updateProjectMutation, updateCurrentProject, navigate]);

  const handlePrevious = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.dimensioning(id));
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

  // Prepare project data with rooms and equipments for the StepQuote component
  const projectDataWithRoomsAndEquipments = {
    ...(currentProject || { id: id }),
    pieces: projectRooms?.rooms || [],
    rooms: projectRooms?.rooms || [],
    surface_loi_carrez: projectRooms?.surfaceLoiCarrez,
    equipments: (projectEquipments?.equipments || []) as any,
  };

  const isFinishing = updateProjectMutation.isPending;

  return (
    <ProjectStepLayout
      currentStep={8}
      onNext={handleNext}
      onPrevious={handlePrevious}
      isLoading={isFinishing}
      nextButtonText={isFinishing ? "Finalisation..." : "Terminer"}
      nextDisabled={isFinishing}
    >
      <StepQuote
        ref={stepQuoteRef}
        onNext={handleNext}
        onPrevious={handlePrevious}
        projectData={projectDataWithRoomsAndEquipments}
        setProjectData={updateCurrentProject}
      />
    </ProjectStepLayout>
  );
} 
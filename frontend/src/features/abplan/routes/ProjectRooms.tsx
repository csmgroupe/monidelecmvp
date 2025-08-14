import { useCallback, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStepLayout } from '../components/shared/ProjectStepLayout';
import { StepRooms } from '../components/StepRooms';
import { PATHS } from '@/config/paths';
import { useCurrentProject } from '@/features/shared/hooks/projects/useCurrentProject';
import { useUpdateProjectRooms } from '@/features/shared/hooks/project-rooms/useUpdateProjectRooms';
import type { Room } from '../types';

export function ProjectRooms() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { 
    currentProject, 
    updateCurrentProject, 
    isLoading: isLoadingProject 
  } = useCurrentProject(id);

  const updateProjectRoomsMutation = useUpdateProjectRooms();

  // Memoize validation logic to avoid unnecessary recalculations
  const validationState = useMemo(() => {
    const pieces = (currentProject as any)?.pieces;
    
    if (!pieces || pieces.length === 0) {
      return {
        isValid: false,
        reason: 'Veuillez ajouter au moins une pièce avant de continuer.'
      };
    }

    const roomsWithoutType = pieces.filter((room: Room) => !room.roomType);
    if (roomsWithoutType.length > 0) {
      const roomNames = roomsWithoutType.map((room: Room) => room.name).join(', ');
      return {
        isValid: false,
        reason: `Veuillez sélectionner un type pour ${roomsWithoutType.length === 1 ? 'la pièce' : 'les pièces'} : ${roomNames}`
      };
    }

    return {
      isValid: true,
      reason: null
    };
  }, [(currentProject as any)?.pieces]);

  const handleNext = useCallback(async () => {
    // Validate that at least one room is added
    const pieces = (currentProject as any)?.pieces;
    if (!pieces || pieces.length === 0) {
      alert('Veuillez ajouter au moins une pièce avant de continuer.');
      return;
    }

    // Validate that all rooms have a type
    const roomsWithoutType = pieces.filter((room: Room) => !room.roomType);
    if (roomsWithoutType.length > 0) {
      const roomNames = roomsWithoutType.map((room: Room) => room.name).join(', ');
      alert(`Veuillez sélectionner un type pour ${roomsWithoutType.length === 1 ? 'la pièce' : 'les pièces'} : ${roomNames}`);
      return;
    }

    if (!id) return;

    try {
      setIsSaving(true);
      
      // Convert frontend Room format to backend format
      const backendRooms = pieces.map((room: Room) => ({
        id: room.id.toString(),
        name: room.name,
        surface: room.surface,
        options: {
          ...room.options,
          exposition: room.exposition,
          roomType: room.roomType
        }
      }));

      // Save rooms before navigating
      await updateProjectRoomsMutation.mutateAsync({
        projectId: id,
        data: {
          rooms: backendRooms,
          surfaceLoiCarrez: (currentProject as any)?.surface_loi_carrez
        }
      });

      // Navigate to next step after successful save
      navigate(PATHS.abplan.steps.equipment(id));
    } catch (error) {
      console.error('Failed to save rooms:', error);
      // Don't navigate if save failed
    } finally {
      setIsSaving(false);
    }
  }, [id, navigate, currentProject, updateProjectRoomsMutation]);

  const handlePrevious = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.plan(id));
    }
  }, [id, navigate]);

  const handleBackToList = useCallback(() => {
    navigate(PATHS.abplan.list);
  }, [navigate]);

  const handleAnalyzingChange = useCallback((analyzing: boolean) => {
    setIsAnalyzing(analyzing);
  }, []);

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
        currentStep={3}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isLoading={isSaving}
        nextDisabled={!validationState.isValid || isSaving}
        previousDisabled={isAnalyzing}
        nextButtonText={isSaving ? 'Sauvegarde...' : undefined}
        nextDisabledReason={validationState.reason}
      >
        <StepRooms
          onNext={handleNext}
          onPrevious={handlePrevious}
          projectData={currentProject || { id: id }}
          setProjectData={updateCurrentProject}
          onAnalyzingChange={handleAnalyzingChange}
        />
      </ProjectStepLayout>
    </>
  );
} 
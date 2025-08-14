import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectStepLayout } from '../components/shared/ProjectStepLayout';
import { StepSummary } from '../components/StepSummary';
import { PATHS } from '@/config/paths';
import { useCurrentProject } from '@/features/shared/hooks/projects/useCurrentProject';
import { useProjectEquipments } from '@/features/shared/hooks/project-equipments/useProjectEquipments';
import { useProjectRooms } from '@/features/shared/hooks/project-rooms/useProjectRooms';
import { AlertTriangle, X } from 'lucide-react';

export function ProjectSummary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    currentProject, 
    updateCurrentProject, 
    isLoading: isLoadingProject 
  } = useCurrentProject(id);

  // Load project rooms for summary display
  const { data: projectRooms, isLoading: isLoadingRooms } = useProjectRooms(id || '');
  
  // Load project equipments for summary display
  const { data: projectEquipments, isLoading: isLoadingEquipments } = useProjectEquipments(id || '');

  const [isCompliant, setIsCompliant] = useState<boolean | null>(null);
  const [showNonComplianceModal, setShowNonComplianceModal] = useState(false);

  const proceedToNextStep = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.dimensioning(id));
    }
  }, [id, navigate]);

  const handleNext = useCallback(() => {
    // Si l'installation est conforme ou pas encore vérifiée, on continue directement
    if (isCompliant !== false) {
      proceedToNextStep();
    } else {
      // Si non conforme, on affiche la popup de confirmation
      setShowNonComplianceModal(true);
    }
  }, [isCompliant, proceedToNextStep]);

  const handleForceNext = useCallback(() => {
    setShowNonComplianceModal(false);
    proceedToNextStep();
  }, [proceedToNextStep]);

  const handlePrevious = useCallback(() => {
    if (id) {
      navigate(PATHS.abplan.steps.options(id));
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

  // Prepare project data with rooms and equipments for the StepSummary component
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
        currentStep={6}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isLoading={false}
        nextDisabled={false} // On ne désactive plus le bouton
        nextDisabledReason={isCompliant === false ? "Installation non conforme NF C 15-100 - Une confirmation sera demandée" : undefined}
      >
        <StepSummary
          onNext={handleNext}
          onPrevious={handlePrevious}
          projectData={projectDataWithRoomsAndEquipments}
          setProjectData={updateCurrentProject}
          onComplianceStatusChange={setIsCompliant}
        />
      </ProjectStepLayout>

      {/* Modal de confirmation pour installation non conforme */}
      {showNonComplianceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-orange-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Installation non conforme
                </h3>
              </div>
              <button
                onClick={() => setShowNonComplianceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Votre installation électrique ne respecte pas entièrement la norme NF C 15-100.
              </p>
              <p className="text-gray-700 mb-3">
                Souhaitez-vous continuer malgré tout vers l'étape de dimensionnement ?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Attention :</strong> Une installation non conforme peut présenter des risques 
                  de sécurité et ne respecte pas les normes électriques en vigueur.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNonComplianceModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleForceNext}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                Continuer quand même
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
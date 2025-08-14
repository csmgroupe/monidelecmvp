import React, { useState } from 'react';
import { AlertTriangle, Upload, X, Trash2, FileText, Loader2 } from 'lucide-react';
import type { Project, PlanFile } from '@/modules/abplan/projects/domain/project.entity';
import { useUploadPlanWithPurge } from '@/features/shared/hooks/plans/useUploadPlanWithPurge';
import { useDeletePlanWithPurge } from '@/features/shared/hooks/plans/useDeletePlanWithPurge';
import { useProjectRooms } from '@/features/shared/hooks/project-rooms/useProjectRooms';
import { ProjectsProvider } from '@/modules/abplan/projects/infrastructure/ProjectsProvider';

interface UploadedPlan {
  id: string;
  filePath: string;
  originalName: string;
  publicUrl?: string;
}

interface StepUploadProps {
  onNext: () => void;
  onPrevious?: () => void;
  projectData: Partial<Project & { uploadedPlan?: UploadedPlan; }>;
  setProjectData: (data: Partial<Project & { uploadedPlan?: UploadedPlan; }>) => void;
}

export function StepUpload({ onNext, onPrevious, projectData, setProjectData }: StepUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PlanFile | null>(null);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  
  const uploadPlanMutation = useUploadPlanWithPurge();
  const deletePlanMutation = useDeletePlanWithPurge();
  const projectsProvider = new ProjectsProvider();
  
  // Get project rooms to check if we need to show confirmation modal
  const { data: projectRooms } = useProjectRooms(projectData.id || '');

  const existingPlans = projectData.planFiles || [];

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleMultipleFileUpload(files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await handleMultipleFileUpload(files);
    }
    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };

  const handleMultipleFileUpload = async (files: File[]) => {
    setError(null);
    
    // Show confirmation modal only if there are existing room analyses to purge
    const hasRoomAnalyses = projectRooms && projectRooms.rooms && projectRooms.rooms.length > 0;
    
    if (hasRoomAnalyses) {
      console.log('[StepUpload] Project has room analyses, showing confirmation modal');
      setFilesToUpload(files);
      setShowUploadConfirm(true);
      return;
    }
    
    // No room analyses to purge, upload directly
    console.log('[StepUpload] No room analyses to purge, uploading directly');
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Purge only for the first file (in case there are equipments without rooms)
      await handleSingleFileUpload(file, i === 0);
    }
  };

  // Function to clear localStorage and refresh project data when purging
  const clearLocalStorage = async () => {
    console.log('[StepUpload] Clearing localStorage and refreshing project data after purge');
    
    if (projectData.id) {
      const TEMP_PROJECT_KEY = `abplan_temp_project_${projectData.id}`;
      try {
        localStorage.removeItem(TEMP_PROJECT_KEY);
        console.log('[StepUpload] Cleared localStorage for project:', projectData.id);
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }

      // Refresh project data from backend to get the purged state
      try {
        console.log('[StepUpload] Fetching fresh project data after purge');
        const updatedProject = await projectsProvider.getProject(projectData.id);
        
        if (updatedProject && typeof updatedProject === 'object') {
          console.log('[StepUpload] Updated project data with fresh backend data');
          setProjectData(updatedProject);
        } else {
          console.warn('[StepUpload] Failed to get fresh project data');
        }
      } catch (error) {
        console.error('Failed to refresh project data after purge:', error);
      }
      
      // Small delay to ensure all state updates are processed before triggering any analysis
      console.log('[StepUpload] Purge complete, states reset');
    }
  };

  const handleSingleFileUpload = async (file: File, shouldPurge: boolean = true) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(`Format de fichier non supporté pour "${file.name}". Utilisez PDF, JPG, PNG, HEIC ou WEBP.`);
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setError(`Le fichier "${file.name}" est trop volumineux. Maximum 20MB.`);
      return;
    }

    // Add file to uploading list
    setUploadingFiles(prev => [...prev, file.name]);

    try {
      if (!projectData.id) {
        throw new Error("ID de projet manquant");
      }

      console.log('[StepUpload] Uploading file:', file.name, 'for project:', projectData.id, 'shouldPurge:', shouldPurge);
      const uploadResult = await uploadPlanMutation.mutateAsync({ 
        file, 
        projectId: projectData.id,
        shouldPurge,
        onPurgeComplete: shouldPurge ? clearLocalStorage : undefined
      });
      
      if (!uploadResult) {
        throw new Error("Échec de l'upload du fichier");
      }

      // Refresh project data from backend to get updated planFiles
      if (projectData.id) {
        try {
          const updatedProject = await projectsProvider.getProject(projectData.id);
          
          if (updatedProject && typeof updatedProject === 'object') {
            setProjectData(updatedProject);
          } else {
            console.warn('[StepUpload] Backend returned invalid project data, using fallback');
            // Fallback: update locally with the plan information
            if (uploadResult?.planFile) {
              const updatedProjectData = {
                ...projectData,
                planFiles: [...(projectData.planFiles || []), {
                  id: uploadResult.planFile.id,
                  path: uploadResult.planFile.filePath,
                  originalName: uploadResult.planFile.originalName,
                  publicUrl: uploadResult.publicUrl
                }]
              };
              setProjectData(updatedProjectData);
            }
          }
        } catch (error) {
          console.error('Failed to refresh project data:', error);
          // Fallback: update locally
          if (uploadResult?.planFile) {
            const updatedProjectData = {
              ...projectData,
              planFiles: [...(projectData.planFiles || []), {
                id: uploadResult.planFile.id,
                path: uploadResult.planFile.filePath,
                originalName: uploadResult.planFile.originalName,
                publicUrl: uploadResult.publicUrl
              }]
            };
            setProjectData(updatedProjectData);
          }
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error) {
        // Check if it's a duplicate error (HTTP 409)
        if (error.message.includes('409') || error.message.includes('identique')) {
          setError(`Fichier dupliqué: "${file.name}" existe déjà dans ce projet.`);
        } else {
          setError(`Erreur lors de l'upload de "${file.name}": ${error.message}`);
        }
      } else {
        setError(`Une erreur est survenue lors de l'upload de "${file.name}".`);
      }
    } finally {
      // Remove file from uploading list
      setUploadingFiles(prev => prev.filter(name => name !== file.name));
    }
  };

  const handleDeletePlan = (planFile: PlanFile) => {
    setPlanToDelete(planFile);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete || !projectData.id) return;

    try {
      await deletePlanMutation.mutateAsync({
        projectId: projectData.id,
        planId: planToDelete.id
      });

      // Update local state
      const updatedPlanFiles = existingPlans.filter(plan => plan.id !== planToDelete.id);
      setProjectData({
        ...projectData,
        planFiles: updatedPlanFiles
      });

      setShowDeleteConfirm(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Erreur lors de la suppression du plan.');
    }
  };

  const confirmUploadPlans = async () => {
    setShowUploadConfirm(false);
    
    const hasRoomAnalyses = projectRooms && projectRooms.rooms && projectRooms.rooms.length > 0;
    console.log('[StepUpload] Confirming upload of plans, has room analyses:', hasRoomAnalyses);
    
    let shouldPurgeForFirstFile = true;
    
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      console.log('[StepUpload] Processing file', i + 1, 'of', filesToUpload.length, '- shouldPurge:', shouldPurgeForFirstFile);
      await handleSingleFileUpload(file, shouldPurgeForFirstFile);
      shouldPurgeForFirstFile = false;
    }
    
    setFilesToUpload([]);
  };


  return (
    <div className="space-y-6">

      {/* Upload zone */}
      <div
        onDrop={handleFileDrop}
        onClick={(e) => {
          // Only trigger file selector if clicking on the div itself, not on the label
          if (e.target === e.currentTarget) {
            document.getElementById('file-upload')?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}
          ${uploadingFiles.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
              <span>
                {uploadingFiles.length > 0 
                  ? `Upload en cours... (${uploadingFiles.length})` 
                  : 'Déposez vos plans ici ou cliquez pour parcourir'
                }
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
                multiple
                disabled={uploadingFiles.length > 0}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Formats acceptés : PDF, JPG, PNG, HEIC, WEBP (max 20MB par fichier)
          </p>
          <p className="text-xs text-gray-500">
            Sélection multiple supportée
          </p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Uploading files */}
      {uploadingFiles.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Upload en cours: {uploadingFiles.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded plans list */}
      {existingPlans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Plans uploadés ({existingPlans.length})
          </h3>
          <div className="space-y-2">
            {existingPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {plan.originalName}
                    </p>
                    {plan.publicUrl && (
                      <a 
                        href={plan.publicUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Voir le plan
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePlan(plan)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Supprimer ce plan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Supprimer le plan
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir supprimer le plan "{planToDelete?.originalName}" ? 
                    Cette action supprimera également toutes les analyses de pièces et sélections d'équipements associées.
                    Cette action est définitive et ne peut pas être annulée.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={confirmDeletePlan}
                disabled={deletePlanMutation.isPending}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletePlanMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPlanToDelete(null);
                }}
                disabled={deletePlanMutation.isPending}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation d'upload */}
      {showUploadConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle className="h-6 w-6 text-orange-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Ajouter de nouveaux plans
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Ajouter de nouveaux plans supprimera toutes les analyses de pièces et sélections d'équipements actuelles.
                    Voulez-vous continuer ?
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Les analyses précédentes seront conservées pour l'audit.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={confirmUploadPlans}
                disabled={uploadingFiles.length > 0}
                className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFiles.length > 0 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  'Continuer'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadConfirm(false);
                  setFilesToUpload([]);
                }}
                disabled={uploadingFiles.length > 0}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
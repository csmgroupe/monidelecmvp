import { useState, useCallback } from 'react';
import { Upload, Plus, History, ArrowRight, Loader2, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';
import type { Room } from '../types';
import { StepProjectInfo } from './StepProjectInfo';
import { StepUpload } from './StepUpload';

import { StepRooms } from './StepRooms';
import { StepOptions } from './StepOptions';
import { StepEquipments } from './StepEquipments';
import { StepSummary } from './StepSummary';
import { StepDimensioning } from './StepDimensioning';
import { StepQuote } from './StepQuote';
import { DisclaimerBanner } from './DisclaimerBanner';
import { useAppSelector } from '@/store/reduxStore';
import { selectDraftProjects, selectCompletedProjects } from '@/modules/abplan/projects/application/projects.selectors';
import { useCreateProject } from '@/features/shared/hooks/projects/useCreateProject';
import { useUpdateProject } from '@/features/shared/hooks/projects/useUpdateProject';
import { useLoadProjects } from '@/features/shared/hooks/projects/useLoadProjects';
import { useDeleteProject } from '@/features/shared/hooks/projects/useDeleteProject';

interface UploadedPlan {
  id: string;
  filePath: string;
  originalName: string;
  publicUrl?: string;
}

// Extended project type for wizard state
type WizardProject = Partial<Project & { 
  pieces?: Room[]; 
  rooms?: Room[]; 
  uploadedPlan?: UploadedPlan; 
}>;

interface WizardStep {
  number: number;
  title: string;
  shortTitle: string;
  isActive: boolean;
  isCompleted: boolean;
}

const steps: WizardStep[] = [
  { number: 1, title: 'Projet', shortTitle: 'Projet', isActive: true, isCompleted: false },
  { number: 2, title: 'Plan', shortTitle: 'Plan', isActive: false, isCompleted: false },
  { number: 3, title: 'Pièces', shortTitle: 'Pièces', isActive: false, isCompleted: false },
  { number: 4, title: 'Équipements', shortTitle: 'Équip.', isActive: false, isCompleted: false },
  { number: 5, title: 'Options', shortTitle: 'Options', isActive: false, isCompleted: false },
  { number: 6, title: 'Récapitulatif', shortTitle: 'Récap.', isActive: false, isCompleted: false },
  { number: 7, title: 'Dimensionnement', shortTitle: 'Dimen.', isActive: false, isCompleted: false },
  { number: 8, title: 'Estimation', shortTitle: 'Estim.', isActive: false, isCompleted: false },
];

export function ProjectWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showNewProject, setShowNewProject] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const draftProjects = useAppSelector(selectDraftProjects);
  const completedProjects = useAppSelector(selectCompletedProjects);

  // React Query hooks
  const { isLoading: isLoadingProjects, data: projectsData } = useLoadProjects({ 
    page: currentPage, 
    limit: pageSize 
  });
  const [projectData, setProjectData] = useState<WizardProject>({
    name: ''
  });

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject(projectData?.id);
  const deleteProjectMutation = useDeleteProject();

  const handleProjectInfoNext = useCallback(() => {
    if (!projectData?.name || !projectData?.numberOfPeople || projectData.numberOfPeople < 1) {
      return;
    }

    const projectFields = {
      name: projectData.name,
      description: projectData.description,
      typeProjet: projectData.typeProjet,
      typeTravaux: projectData.typeTravaux,
      codePostal: projectData.codePostal,
      numberOfPeople: projectData.numberOfPeople,
    };

    if (projectData?.id) {
      updateProjectMutation.mutate({
        projectId: projectData.id,
        data: projectFields
      }, {
        onSuccess: (updatedProject) => {
          console.log('Project updated:', updatedProject);
          setProjectData(prev => ({
            ...prev,
            ...updatedProject,
          }));
          setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
      });
    } else {
      createProjectMutation.mutate(projectFields, {
        onSuccess: (project) => {
          console.log('Project created:', project);
          if (project && typeof project === 'object' && 'id' in project) {
            const createdProject = project as Project;
            setProjectData(prev => ({
              ...prev,
              id: createdProject.id,
              name: createdProject.name,
              description: createdProject.description,
              typeProjet: createdProject.typeProjet,
              typeTravaux: createdProject.typeTravaux,
              codePostal: createdProject.codePostal,
              createdAt: createdProject.createdAt,
              updatedAt: createdProject.updatedAt,
              status: createdProject.status || 'draft',
              planFiles: createdProject.planFiles || []
            }));
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
          } else {
            console.error('Invalid project data received:', project);
          }
        }
      });
    }
  }, [projectData, createProjectMutation, updateProjectMutation, steps.length]);

  const handleNext = useCallback(() => {
    if (currentStep === steps.length) {
      setShowNewProject(false);
      setProjectData({
        name: ''
      });
      setCurrentStep(1);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleDeleteClick = useCallback((project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        },
        onError: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }, [projectToDelete, deleteProjectMutation]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
  }, []);

  const renderStep = useCallback(() => {
    console.log('ProjectWizard renderStep - currentStep:', currentStep, 'projectData:', projectData);
    
    switch (currentStep) {
      case 1:
        return (
          <StepProjectInfo
            onNext={handleProjectInfoNext}
            projectData={projectData}
            setProjectData={setProjectData}
            isLoading={createProjectMutation.isPending || updateProjectMutation.isPending}
          />
        );
      case 2:
        return (
          <StepUpload
            onNext={handleNext}
            onPrevious={handlePrevious}
            projectData={projectData}
            setProjectData={setProjectData}
          />
        );
      case 3:
        return (
          <StepRooms
            onNext={handleNext}
            onPrevious={handlePrevious}
            projectData={projectData}
            setProjectData={setProjectData}
          />
        );
      case 4:
        return (
          <StepEquipments
            onNext={handleNext}
            onPrevious={handlePrevious}
            projectData={projectData}
            setProjectData={setProjectData}
          />
        );
      case 5:
        return (
          <StepOptions
            onNext={handleNext}
            onPrevious={handlePrevious}
            projectData={projectData}
            setProjectData={setProjectData}
          />
        );
      case 6:
        return (
          <StepSummary
            onNext={handleNext}
            onPrevious={handlePrevious}
            projectData={projectData}
            setProjectData={setProjectData}
          />
        );
      case 7:
        return (
          <StepDimensioning
            onNext={handleNext}
            onPrevious={handlePrevious}
            projectData={projectData}
            setProjectData={setProjectData}
            onLoadingChange={() => {}}
          />
        );
      case 8:
        return (
          <StepQuote
            onNext={handleNext}
            onPrevious={handlePrevious}
            projectData={projectData}
            setProjectData={setProjectData}
          />
        );
      default:
        return null;
    }
  }, [currentStep, projectData, handleNext, handlePrevious, handleProjectInfoNext, createProjectMutation.isPending, updateProjectMutation.isPending]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!showNewProject ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Projets ID Plan</h1>
              <button
                onClick={() => {
                  setShowNewProject(true);
                  setProjectData({ name: '' });
                  setCurrentStep(1);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Créer un nouveau projet</span>
              </button>
            </div>

            {isLoadingProjects ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chargement des projets...</h3>
                <p className="mt-1 text-sm text-gray-500">Veuillez patienter pendant que nous récupérons vos projets</p>
              </div>
            ) : (draftProjects.length > 0 || completedProjects.length > 0) ? (
              <div className="space-y-4">
                <div className="grid gap-6">
                  {draftProjects.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Projets en cours</h2>
                      <div className="grid gap-4">
                        {draftProjects.map(project => (
                          <div
                            key={project.id}
                            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                                <p className="text-sm text-gray-500">
                                  Dernière modification: {new Date(project.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDeleteClick(project)}
                                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer le projet"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setProjectData({
                                      ...project,
                                      // Ensure all wizard fields are populated
                                      typeProjet: project.typeProjet,
                                      typeTravaux: project.typeTravaux,
                                      codePostal: project.codePostal,
                                    });
                                    setShowNewProject(true);
                                    setCurrentStep(1);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <History className="w-5 h-5" />
                                  <span>Reprendre</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {completedProjects.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Projets terminés</h2>
                      <div className="grid gap-4">
                        {completedProjects.map(project => (
                          <div
                            key={project.id}
                            className="bg-white p-6 rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                                <p className="text-sm text-gray-500">
                                  Terminé le: {new Date(project.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDeleteClick(project)}
                                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer le projet"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setProjectData(project);
                                    setShowNewProject(true);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <ArrowRight className="w-5 h-5" />
                                  <span>Voir</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {projectsData && projectsData.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, projectsData.totalPages))}
                        disabled={currentPage === projectsData.totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Affichage de{' '}
                          <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> à{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * pageSize, projectsData.total)}
                          </span>{' '}
                          sur <span className="font-medium">{projectsData.total}</span> projets
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                          </button>
                          
                          {/* Page numbers */}
                          {Array.from({ length: projectsData.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                page === currentPage
                                  ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, projectsData.totalPages))}
                            disabled={currentPage === projectsData.totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
                <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier projet</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowNewProject(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau projet
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              {projectData?.id ? 'Modifier le projet' : 'Nouveau projet Ab\'Plan'}
            </h1>
            {/* <DisclaimerBanner /> */}

            {/* Progress Steps */}
            <div className="mb-8">
              <nav aria-label="Progress">
                {/* Version mobile/compact */}
                <div className="block lg:hidden">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                        {currentStep}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {steps.find(s => s.number === currentStep)?.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Étape {currentStep} sur {steps.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {steps.map((step) => (
                        <div
                          key={step.number}
                          className={`w-2 h-2 rounded-full ${
                            step.number === currentStep
                              ? 'bg-blue-600'
                              : step.number < currentStep
                              ? 'bg-green-600'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Version desktop - stepper horizontal optimisé */}
                <div className="hidden lg:block">
                  <div className="relative">
                    {/* Ligne de progression de fond */}
                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200" aria-hidden="true" />
                    {/* Ligne de progression colorée */}
                    <div 
                      className="absolute left-0 top-4 h-0.5 bg-green-500 transition-all duration-500" 
                      style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                      aria-hidden="true" 
                    />
                    
                    <ol className="relative flex items-center justify-between">
                      {steps.map((step, index) => (
                        <li key={step.number} className="flex flex-col items-center bg-gray-50 px-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                            currentStep === step.number ? 'bg-blue-600 text-white scale-110 shadow-lg' :
                              currentStep > step.number ? 'bg-green-600 text-white' :
                                'bg-gray-50 text-gray-500 border-2 border-gray-300'}`}
                            title={step.title}
                          >
                            {step.number}
                          </div>
                          <span className={`mt-2 text-sm font-medium transition-colors ${
                            currentStep === step.number ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {step.shortTitle}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </nav>
            </div>
            <div className="mt-8">
              {renderStep()}
            </div>
          </div>
        )}

        {/* Modale de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Supprimer le projet
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir supprimer le projet "{projectToDelete?.name}" ? 
                      Cette action est définitive et ne peut pas être annulée.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteProjectMutation.isPending}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteProjectMutation.isPending ? (
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
                  onClick={handleDeleteCancel}
                  disabled={deleteProjectMutation.isPending}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
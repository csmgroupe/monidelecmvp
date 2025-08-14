import { useEffect, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/reduxStore';
import { selectCurrentProject } from '@/modules/abplan/projects/application/projects.selectors';
import { actions } from '@/modules/abplan/projects/application/projects.actions';
import { useGetProject } from './useGetProject';
import { useProjectPersistence } from './useProjectPersistence';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';

export function useCurrentProject(projectId?: string) {
  const dispatch = useAppDispatch();
  const currentProject = useAppSelector(selectCurrentProject);
  
  // Keep track of the last processed project API data to avoid infinite loops
  const lastProcessedProjectRef = useRef<string | null>(null);
  
  // Fetch project data from API when needed
  const { 
    data: projectFromAPI, 
    isLoading: isLoadingFromAPI,
    error 
  } = useGetProject(projectId, { 
    enabled: !!projectId && projectId !== 'new' 
  });

  // Handle temporary project persistence
  const { 
    saveTempProject, 
    getTempProject, 
    clearTempProject, 
    hasTempProject 
  } = useProjectPersistence(projectId);

  useEffect(() => {
    if (projectId === 'new') {
      // Clear current project for new projects
      if (currentProject?.id !== undefined) {
        dispatch(actions.setCurrentProject({ project: null }));
      }
      return;
    }

    if (!projectFromAPI) {
      return;
    }

    // Create a signature of the project data to track if we've already processed it
    const projectSignature = JSON.stringify({
      id: projectFromAPI.id,
      name: projectFromAPI.name,
      description: projectFromAPI.description,
      status: projectFromAPI.status,
      updatedAt: projectFromAPI.updatedAt,
    });

    // Skip processing if we've already processed this exact project data
    if (lastProcessedProjectRef.current === projectSignature) {
      return;
    }

    // Update the ref before processing to prevent loops
    lastProcessedProjectRef.current = projectSignature;

    // Add the project to the projects list if it's not already there
    dispatch(actions.updateProject({ project: projectFromAPI }));
    
    // Get temp project data only when needed to avoid dependency loop
    const tempProjectData = getTempProject();
    if (tempProjectData && Object.keys(tempProjectData).length > 1) {
      // Merge API data with temporary changes
      const mergedProject = { ...projectFromAPI, ...tempProjectData };
      dispatch(actions.setCurrentProject({ project: mergedProject }));
    } else {
      // Use API data as-is
      dispatch(actions.setCurrentProject({ project: projectFromAPI }));
    }
  }, [projectId, projectFromAPI, dispatch, getTempProject]);



  const updateCurrentProject = useCallback((updates: Partial<Project>) => {
    const baseProject = currentProject || {
      name: '',
      description: '',
      typeProjet: undefined,
      typeTravaux: undefined,
      codePostal: ''
    };
    
    const updatedProject = { ...baseProject, ...updates };
    dispatch(actions.setCurrentProject({ project: updatedProject as Project }));
    
    // Save to temporary storage for persistence
    if (projectId && projectId !== 'new') {
      saveTempProject(updatedProject);
    }
  }, [currentProject, dispatch, saveTempProject, projectId]);

  const setCurrentProject = useCallback((project: Project | null) => {
    dispatch(actions.setCurrentProject({ project }));
    
    // Clear temporary data when setting a new project
    if (project && projectId) {
      clearTempProject();
    }
  }, [dispatch, projectId, clearTempProject]);

  return {
    currentProject,
    projectFromAPI,
    updateCurrentProject,
    setCurrentProject,
    isNewProject: projectId === 'new',
    isLoading: isLoadingFromAPI,
    error,
    hasTempChanges: hasTempProject(),
    clearTempProject,
  };
} 
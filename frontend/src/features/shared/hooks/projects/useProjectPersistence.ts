import { useEffect, useCallback } from 'react';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';

const TEMP_PROJECT_KEY = 'abplan_temp_project_';

export function useProjectPersistence(projectId?: string) {
  const saveTempProject = useCallback((project: Partial<Project>) => {
    if (!projectId) return;
    
    try {
      localStorage.setItem(
        `${TEMP_PROJECT_KEY}${projectId}`,
        JSON.stringify({
          ...project,
          lastSaved: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.warn('Failed to save temporary project data:', error);
    }
  }, [projectId]);

  const getTempProject = useCallback((): Partial<Project> | null => {
    if (!projectId) return null;
    
    try {
      const saved = localStorage.getItem(`${TEMP_PROJECT_KEY}${projectId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Remove the lastSaved timestamp before returning
        const { lastSaved, ...project } = parsed;
        return project;
      }
    } catch (error) {
      console.warn('Impossible de charger les données du projet temporaire:', error);
    }
    return null;
  }, [projectId]);

  const clearTempProject = useCallback(() => {
    if (!projectId) return;
    
    try {
      localStorage.removeItem(`${TEMP_PROJECT_KEY}${projectId}`);
    } catch (error) {
      console.warn('Failed to clear temporary project data:', error);
    }
  }, [projectId]);

  const hasTempProject = useCallback((): boolean => {
    if (!projectId) return false;
    
    try {
      return localStorage.getItem(`${TEMP_PROJECT_KEY}${projectId}`) !== null;
    } catch (error) {
      return false;
    }
  }, [projectId]);

  // Auto-cleanup old temp projects (older than 24 hours)
  useEffect(() => {
    try {
      const now = new Date();
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(TEMP_PROJECT_KEY)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '');
            if (data.lastSaved) {
              const savedDate = new Date(data.lastSaved);
              const hoursDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60);
              
              if (hoursDiff > 24) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // Invalid data, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup old temporary project data:', error);
    }
  }, []);

  return {
    saveTempProject,
    getTempProject,
    clearTempProject,
    hasTempProject,
  };
} 
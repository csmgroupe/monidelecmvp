import React, { useState } from 'react';
import { Loader2, Building2, Hammer, MapPin, Users } from 'lucide-react';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';

interface StepProjectInfoProps {
  onNext: () => void;
  projectData: Partial<Project>;
  setProjectData: (data: Partial<Project>) => void;
  isLoading?: boolean;
  validateForm?: () => boolean;
}

export function StepProjectInfo({ onNext, projectData, setProjectData, isLoading = false }: StepProjectInfoProps) {
  const [errors, setErrors] = useState<{ 
    name?: string; 
    description?: string;
    typeProjet?: string;
    typeTravaux?: string;
    codePostal?: string;
    numberOfPeople?: string;
  }>({});

  const validateForm = React.useCallback(() => {
    const newErrors: { 
      name?: string; 
      description?: string;
      typeProjet?: string;
      typeTravaux?: string;
      codePostal?: string;
      numberOfPeople?: string;
    } = {};
    
    if (!projectData.name?.trim()) {
      newErrors.name = 'Le nom du projet est requis';
    }

    if (!projectData.typeProjet) {
      newErrors.typeProjet = 'Le type de projet est requis';
    }

    if (!projectData.typeTravaux) {
      newErrors.typeTravaux = 'Le type de travaux est requis';
    }

    if (!projectData.codePostal?.trim()) {
      newErrors.codePostal = 'Le code postal est requis';
    } else if (!/^\d{5}$/.test(projectData.codePostal.trim())) {
      newErrors.codePostal = 'Le code postal doit contenir 5 chiffres';
    }
    
    if (!projectData.numberOfPeople || projectData.numberOfPeople < 1) {
      newErrors.numberOfPeople = 'Le nombre de personnes dans le logement est requis et doit être supérieur à 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [projectData]);

  // Validate form when projectData changes
  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      validateForm();
    }
  }, [projectData, validateForm, errors]);

  // Expose validation function to parent
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).validateProjectForm = validateForm;
    }
  }, [validateForm]);

  return (
    <div className="mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations du projet</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du projet *
            </label>
            <input
              type="text"
              id="project-name"
              value={projectData.name || ''}
              onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Entrez le nom de votre projet"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              id="project-description"
              rows={4}
              value={projectData.description || ''}
              onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Décrivez votre projet (optionnel)"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="type-projet" className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Type de projet *
              </label>
              <select
                id="type-projet"
                value={projectData.typeProjet || ''}
                onChange={(e) => setProjectData({ ...projectData, typeProjet: e.target.value as 'Résidentiel' | 'Tertiaire' })}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${
                  errors.typeProjet ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner le type</option>
                <option value="Résidentiel">Résidentiel</option>
                <option disabled value="Tertiaire">Tertiaire</option>
              </select>
              {errors.typeProjet && (
                <p className="mt-1 text-sm text-red-600">{errors.typeProjet}</p>
              )}
            </div>

            <div>
              <label htmlFor="type-travaux" className="block text-sm font-medium text-gray-700 mb-2">
                <Hammer className="w-4 h-4 inline mr-1" />
                Type de travaux *
              </label>
              <select
                id="type-travaux"
                value={projectData.typeTravaux || ''}
                onChange={(e) => setProjectData({ ...projectData, typeTravaux: e.target.value as 'Construction' | 'Renovation' })}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${
                  errors.typeTravaux ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner le type</option>
                <option value="Construction">Construction</option>
                <option disabled value="Renovation">Rénovation</option>
              </select>
              {errors.typeTravaux && (
                <p className="mt-1 text-sm text-red-600">{errors.typeTravaux}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="code-postal" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Code postal du projet *
            </label>
            <input
              type="text"
              id="code-postal"
              value={projectData.codePostal || ''}
              onChange={(e) => setProjectData({ ...projectData, codePostal: e.target.value })}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${
                errors.codePostal ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: 75001"
              maxLength={5}
              pattern="\d{5}"
            />
            {errors.codePostal && (
              <p className="mt-1 text-sm text-red-600">{errors.codePostal}</p>
            )}
          </div>

          <div>
            <label htmlFor="project-number-of-people" className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1 text-gray-400" /> Nombre de personnes dans le logement *
            </label>
            <input
              type="number"
              id="project-number-of-people"
              min={1}
              value={projectData.numberOfPeople || ''}
              onChange={e => setProjectData({ ...projectData, numberOfPeople: Number(e.target.value) })}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ex: 4"
            />
            {errors.numberOfPeople && (
              <p className="mt-1 text-sm text-red-600">{errors.numberOfPeople}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
} 
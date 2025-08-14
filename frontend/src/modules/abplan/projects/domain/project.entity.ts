export interface PlanFile {
  id: string;
  path: string;
  originalName?: string;
  publicUrl: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  typeProjet?: 'Résidentiel' | 'Tertiaire';
  typeTravaux?: 'Construction' | 'Renovation';
  codePostal?: string;
  status?: 'draft' | 'analyzing' | 'ready' | 'completed';
  userId?: string;
  planFiles?: PlanFile[];
  createdAt: string;
  updatedAt: string;
  numberOfPeople?: number;
  dimensioning?: any;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  typeProjet?: 'Résidentiel' | 'Tertiaire';
  typeTravaux?: 'Construction' | 'Renovation';
  codePostal?: string;
  numberOfPeople?: number;
  dimensioning?: any;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  typeProjet?: 'Résidentiel' | 'Tertiaire';
  typeTravaux?: 'Construction' | 'Renovation';
  codePostal?: string;
  numberOfPeople?: number;
  dimensioning?: any;
  status?: 'draft' | 'analyzing' | 'ready' | 'completed';
} 
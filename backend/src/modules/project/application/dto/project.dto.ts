export interface PlanFileDto {
  id: string;
  path: string;
  originalName?: string;
  publicUrl: string;
}

export class ProjectDto {
  id: string;
  name: string;
  description?: string;
  typeProjet?: 'Résidentiel' | 'Tertiaire';
  typeTravaux?: 'Construction' | 'Renovation';
  codePostal?: string;
  userId: string;
  planFiles?: PlanFileDto[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  number_of_people?: number;
  dimensioning_data?: any;
} 
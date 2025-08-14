import { IsOptional, IsString, IsIn, Matches, IsInt, Min } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Résidentiel', 'Tertiaire'])
  typeProjet?: 'Résidentiel' | 'Tertiaire';

  @IsOptional()
  @IsString()
  @IsIn(['Construction', 'Renovation'])
  typeTravaux?: 'Construction' | 'Renovation';

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}$/, { message: 'Le code postal doit contenir exactement 5 chiffres' })
  codePostal?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  number_of_people?: number;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'analyzing', 'ready', 'completed'])
  status?: 'draft' | 'analyzing' | 'ready' | 'completed';

  @IsOptional()
  dimensioning_data?: any;
} 
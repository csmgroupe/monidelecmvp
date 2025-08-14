import { IsNotEmpty, IsOptional, IsString, IsIn, Matches, IsInt, Min } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

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
} 
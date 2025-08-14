import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordConfirmDto {
  @ApiProperty({ 
    description: 'Reset code from email link',
    example: 'bf3c5078-f6e1-4540-85f3-52cad13da4cd'
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ 
    description: 'New password (minimum 6 characters)',
    example: 'newPassword123'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
} 
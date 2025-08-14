import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Provider } from '@supabase/supabase-js';
import { ApiProperty } from '@nestjs/swagger';

export class SSORequestDto {
  @ApiProperty({ 
    description: 'OAuth provider',
    enum: ['google', 'github', 'azure', 'facebook', 'twitter', 'apple'],
    example: 'google'
  })
  @IsNotEmpty()
  @IsEnum(['google', 'github', 'azure', 'facebook', 'twitter', 'apple'] as Provider[])
  provider: Provider;

  @ApiProperty({ 
    description: 'URL to redirect to after successful authentication',
    example: 'http://localhost:5173/dashboard',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+/, {
    message: 'redirectTo must be a valid HTTP or HTTPS URL'
  })
  redirectTo?: string;
}

export class SSOCallbackDto {
  @ApiProperty({ 
    description: 'Authorization code from OAuth provider',
    example: 'abc123def456'
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ 
    description: 'State parameter for CSRF protection',
    required: false
  })
  @IsOptional()
  @IsString()
  state?: string;
}

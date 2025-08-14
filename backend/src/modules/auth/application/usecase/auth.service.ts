import { Injectable, Inject, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Provider } from '@supabase/supabase-js';
import { SupabaseAuthService } from '../../infrastructure/adapter/out/supabase-auth.service';
import { UserMapper } from '../../../user/application/mapper/user.mapper';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../../user/domain/repository/user-repository.interface';
import { User } from '../../../user/domain/entity/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Create user in Supabase Auth (this will throw ConflictException if user exists)
    const userData = {
      company: registerDto.company,
      siret: registerDto.siret,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    };

    const authData = await this.supabaseAuthService.signUp(
      registerDto.email,
      registerDto.password,
      userData,
    );

    if (!authData.user) {
      throw new BadRequestException('Failed to create user in Supabase');
    }

    // Create user in our database
    const user = new User(
      registerDto.company,
      registerDto.siret,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.email,
    );
    
    // Use the Supabase user ID
    user.id = authData.user.id;
    
    // Save user to our database
    const savedUser = await this.userRepository.save(user);

    // Return response
    return {
      user: this.userMapper.toDto(savedUser),
      accessToken: authData.session?.access_token || '',
      refreshToken: authData.session?.refresh_token || undefined,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Sign in with Supabase
    const authData = await this.supabaseAuthService.signIn(
      loginDto.email,
      loginDto.password,
    );

    if (!authData.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user from our database
    let user = await this.userRepository.findById(authData.user.id);

    // This should probably be an error for email/password login
    // OAuth users should be handled separately
    if (!user) {
      // For email/password login, this indicates a data inconsistency
      throw new BadRequestException('User account not properly initialized. Please contact support.');
    }

    // Return response
    return {
      user: this.userMapper.toDto(user),
      accessToken: authData.session?.access_token || '',
      refreshToken: authData.session?.refresh_token || undefined,
    };
  }

  async signOut(token: string): Promise<boolean> {
    return this.supabaseAuthService.signOut(token);
  }

  async resetPassword(email: string, redirectUrl: string): Promise<boolean> {
    return this.supabaseAuthService.resetPassword(email, redirectUrl);
  }

  async confirmResetPassword(code: string, newPassword: string): Promise<boolean> {
    return this.supabaseAuthService.confirmResetPassword(code, newPassword);
  }

  async updatePassword(token: string, currentPassword: string, newPassword: string): Promise<boolean> {
    return this.supabaseAuthService.updatePassword(token, currentPassword, newPassword);
  }

  async getUserByToken(token: string): Promise<any> {
    const user = await this.supabaseAuthService.getUserByToken(token);
    
    if (!user) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
    
    return user;
  }

  async signInWithSSO(provider: Provider, redirectTo?: string) {
    return this.supabaseAuthService.signInWithSSO(provider, redirectTo);
  }

  async handleSSOCallback(code: string) {
    const data = await this.supabaseAuthService.handleSSOCallback(code);
    
    if (data.user) {
      // Check if user exists in our database
      let user = await this.userRepository.findById(data.user.id);
      
      // If user doesn't exist in our database yet, create it
      if (!user) {
        const userData = data.user.user_metadata;
        user = new User(
          userData.company || '',
          userData.siret || '',
          userData.firstName || userData.name || '',
          userData.lastName || '',
          data.user.email || '',
        );
        user.id = data.user.id;
        await this.userRepository.save(user);
      }
    }
    
    return data;
  }

  async handleSSOUser(user: any) {
    // Check if user exists in our database
    let existingUser = await this.userRepository.findById(user.id);
    
    // If user doesn't exist in our database yet, create it
    if (!existingUser) {
      const userData = user.user_metadata;
      const newUser = new User(
        userData.company || '',
        userData.siret || '',
        userData.firstName || userData.name || '',
        userData.lastName || '',
        user.email || '',
      );
      newUser.id = user.id;
      await this.userRepository.save(newUser);
    }
    
    return existingUser;
  }
}

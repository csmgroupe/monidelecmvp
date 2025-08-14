import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../../user/domain/repository/user-repository.interface';
import { User } from '../../../user/domain/entity/user.entity';
import { UserMapper } from '../../../user/application/mapper/user.mapper';
import { Auth } from '../../domain/entity/auth.entity';
import { IAuthRepository, AUTH_REPOSITORY_TOKEN } from '../../domain/repository/auth-repository.interface';
import { PasswordService } from '../../domain/service/password.service';
import { JwtService } from '../../domain/service/jwt.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RegisterDto } from '../dto/register.dto';
import { IRegisterUseCase } from '../port/in/register.port';

@Injectable()
export class RegisterUseCase implements IRegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user with email already exists
    const existingAuth = await this.authRepository.findByEmail(registerDto.email);
    if (existingAuth) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = new User(
      registerDto.company,
      registerDto.siret,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.email,
    );
    
    // Save user
    const savedUser = await this.userRepository.save(user);

    // Hash password
    const hashedPassword = await this.passwordService.hash(registerDto.password);

    // Create auth record
    const auth = new Auth(savedUser, registerDto.email, hashedPassword);
    
    // Save auth record
    await this.authRepository.save(auth);

    // Generate JWT token
    const accessToken = this.jwtService.generateToken(savedUser);

    // Return response
    return {
      user: this.userMapper.toDto(savedUser),
      accessToken,
      refreshToken: undefined,
    };
  }
}

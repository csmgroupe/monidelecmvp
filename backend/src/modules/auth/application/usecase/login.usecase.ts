import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { UserMapper } from '../../../user/application/mapper/user.mapper';
import { IAuthRepository, AUTH_REPOSITORY_TOKEN } from '../../domain/repository/auth-repository.interface';
import { PasswordService } from '../../domain/service/password.service';
import { JwtService } from '../../domain/service/jwt.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { ILoginUseCase } from '../port/in/login.port';

@Injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find auth record by email
    const auth = await this.authRepository.findByEmail(loginDto.email);
    if (!auth) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(
      loginDto.password,
      auth.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user
    const user = auth.user.unwrap();

    // Generate JWT token
    const accessToken = this.jwtService.generateToken(user);

    // Return response
    return {
      user: this.userMapper.toDto(user),
      accessToken,
      refreshToken: undefined,
    };
  }
}

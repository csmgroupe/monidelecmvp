import { AuthResponseDto } from '../../dto/auth-response.dto';
import { RegisterDto } from '../../dto/register.dto';

export interface IRegisterUseCase {
  execute(registerDto: RegisterDto): Promise<AuthResponseDto>;
}

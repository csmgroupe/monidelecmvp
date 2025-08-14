import { AuthResponseDto } from '../../dto/auth-response.dto';
import { LoginDto } from '../../dto/login.dto';

export interface ILoginUseCase {
  execute(loginDto: LoginDto): Promise<AuthResponseDto>;
}

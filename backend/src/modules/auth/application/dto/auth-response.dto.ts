import { UserDto } from '../../../user/application/dto/user.dto';

export class AuthResponseDto {
  user: UserDto;
  accessToken: string;
  refreshToken?: string;
}

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from '../../../user/application/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  declare email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

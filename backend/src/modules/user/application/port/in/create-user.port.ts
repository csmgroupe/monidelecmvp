import { CreateUserDto } from '../../dto/create-user.dto';
import { UserDto } from '../../dto/user.dto';

export interface ICreateUserUseCase {
  execute(createUserDto: CreateUserDto): Promise<UserDto>;
}

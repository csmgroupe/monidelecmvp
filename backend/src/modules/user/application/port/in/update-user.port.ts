import { UpdateUserDto } from '../../dto/update-user.dto';
import { UserDto } from '../../dto/user.dto';

export interface IUpdateUserUseCase {
  execute(id: string, updateUserDto: UpdateUserDto): Promise<UserDto>;
} 
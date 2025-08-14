import { UserDto } from '../../dto/user.dto';

export interface IGetUserUseCase {
  execute(id: string): Promise<UserDto | null>;
  findByEmail(email: string): Promise<UserDto | null>;
  findAll(): Promise<UserDto[]>;
}

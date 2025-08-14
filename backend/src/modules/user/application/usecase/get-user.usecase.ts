import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../domain/repository/user-repository.interface';
import { UserDto } from '../dto/user.dto';
import { UserMapper } from '../mapper/user.mapper';
import { IGetUserUseCase } from '../port/in/get-user.port';

@Injectable()
export class GetUserUseCase implements IGetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(id: string): Promise<UserDto | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.userMapper.toDto(user) : null;
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.userMapper.toDto(user) : null;
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => this.userMapper.toDto(user));
  }
}

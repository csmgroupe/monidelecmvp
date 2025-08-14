import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../domain/repository/user-repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';
import { UserMapper } from '../mapper/user.mapper';
import { ICreateUserUseCase } from '../port/in/create-user.port';

@Injectable()
export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<UserDto> {
    // Check if user with email already exists
    if (createUserDto.email) {
      const existingUser = await this.userRepository.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    // Create new user entity
    const user = this.userMapper.toDomain(createUserDto);
    
    // Save user to database
    const savedUser = await this.userRepository.save(user);
    
    // Return user DTO
    return this.userMapper.toDto(savedUser);
  }
}

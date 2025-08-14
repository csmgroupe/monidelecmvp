import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../domain/repository/user-repository.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto } from '../dto/user.dto';
import { UserMapper } from '../mapper/user.mapper';
import { IUpdateUserUseCase } from '../port/in/update-user.port';

@Injectable()
export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    // Find existing user
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(updateUserDto.email);
      if (userWithEmail) {
        throw new Error('User with this email already exists');
      }
    }

    // Update user properties
    if (updateUserDto.company !== undefined) existingUser.company = updateUserDto.company;
    if (updateUserDto.siret !== undefined) existingUser.siret = updateUserDto.siret;
    if (updateUserDto.firstName !== undefined) existingUser.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName !== undefined) existingUser.lastName = updateUserDto.lastName;
    if (updateUserDto.email !== undefined) existingUser.email = updateUserDto.email;

    // Save updated user
    const updatedUser = await this.userRepository.update(existingUser);
    
    // Return user DTO
    return this.userMapper.toDto(updatedUser);
  }
} 
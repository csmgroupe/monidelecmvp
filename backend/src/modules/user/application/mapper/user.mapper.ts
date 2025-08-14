import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entity/user.entity';
import { UserDto } from '../dto/user.dto';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserMapper {
  toDto(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.company = user.company;
    dto.siret = user.siret;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.email = user.email;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  toDomain(createUserDto: CreateUserDto): User {
    return new User(
      createUserDto.company,
      createUserDto.siret,
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.email,
    );
  }
}

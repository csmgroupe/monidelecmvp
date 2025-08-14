import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserMapper } from './application/mapper/user.mapper';
import { CreateUserUseCase } from './application/usecase/create-user.usecase';
import { GetUserUseCase } from './application/usecase/get-user.usecase';
import { UpdateUserUseCase } from './application/usecase/update-user.usecase';
import { DeleteUserUseCase } from './application/usecase/delete-user.usecase';
import { User } from './domain/entity/user.entity';
import { UserController } from './infrastructure/adapter/in/user.controller';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { USER_REPOSITORY_TOKEN } from './domain/repository/user-repository.interface';

@Module({
  imports: [
    MikroOrmModule.forFeature([User])
  ],
  controllers: [UserController],
  providers: [
    UserMapper,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [
    UserMapper,
    USER_REPOSITORY_TOKEN,
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ]
})
export class UserModule {}

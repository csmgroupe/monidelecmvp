import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/usecase/create-user.usecase';
import { GetUserUseCase } from '../../../application/usecase/get-user.usecase';
import { UpdateUserUseCase } from '../../../application/usecase/update-user.usecase';
import { DeleteUserUseCase } from '../../../application/usecase/delete-user.usecase';
import { CreateUserDto } from '../../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../../application/dto/update-user.dto';
import { UserDto } from '../../../application/dto/user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserDto | null> {
    return this.getUserUseCase.execute(id);
  }

  @Get()
  async findAll(): Promise<UserDto[]> {
    return this.getUserUseCase.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteUserUseCase.execute(id);
  }
}

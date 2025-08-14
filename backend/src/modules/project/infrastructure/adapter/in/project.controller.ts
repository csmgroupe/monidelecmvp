import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { ProjectService } from '../../../application/usecase/project.service';
import { CreateProjectDto } from '../../../application/dto/create-project.dto';
import { UpdateProjectDto } from '../../../application/dto/update-project.dto';
import { ProjectDto } from '../../../application/dto/project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(
    @Req() request: Request,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectDto> {
    const userId = request['user']?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.projectService.create(userId, createProjectDto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: 'string', description: 'Page number', example: '1' })
  @ApiQuery({ name: 'limit', required: false, type: 'string', description: 'Number of items per page', example: '10' })
  async findAll(
    @Req() request: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ): Promise<{ projects: ProjectDto[], total: number, page: number, totalPages: number }> {
    const user = request['user'];
    if (!user) {
      throw new Error('User not authenticated');
    }
    const userId = user.id;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new Error('Invalid pagination parameters');
    }
    
    const result = await this.projectService.findByUserIdWithPagination(userId, pageNum, limitNum);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectDto | null> {
    return this.projectService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.projectService.delete(id);
  }

  @Post(':id/plan')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPlan(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ): Promise<ProjectDto> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    return this.projectService.uploadPlan(
      id,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Get(':id/plan/url')
  async getPlanUrl(@Param('id') id: string): Promise<{ url: string | null }> {
    const url = await this.projectService.getPlanUrl(id);
    return { url };
  }
}

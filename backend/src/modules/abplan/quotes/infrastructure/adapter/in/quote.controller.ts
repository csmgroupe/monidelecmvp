import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { QuoteService } from '../../../application/usecase/quote.service';
import { CreateQuoteDto } from '../../../application/dto/create-quote.dto';
import { UpdateQuoteDto } from '../../../application/dto/update-quote.dto';
import { QuoteDto } from '../../../application/dto/quote.dto';
import { AuthGuard } from '../../../../../auth/infrastructure/guard/auth.guard';

@Controller('quotes')
@UseGuards(AuthGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuote(@Body() createQuoteDto: CreateQuoteDto): Promise<QuoteDto> {
    return this.quoteService.createQuote(createQuoteDto);
  }

  @Get(':id')
  async getQuoteById(@Param('id') id: string): Promise<QuoteDto> {
    return this.quoteService.getQuoteById(id);
  }

  @Get('project/:projectId')
  async getQuotesByProjectId(@Param('projectId') projectId: string): Promise<QuoteDto[]> {
    return this.quoteService.getQuotesByProjectId(projectId);
  }

  @Put(':id')
  async updateQuote(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto
  ): Promise<QuoteDto> {
    return this.quoteService.updateQuote(id, updateQuoteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuote(@Param('id') id: string): Promise<void> {
    return this.quoteService.deleteQuote(id);
  }
} 
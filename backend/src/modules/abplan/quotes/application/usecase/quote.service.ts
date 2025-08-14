import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Quote } from '../../domain/quote.entity';
import { QuoteRepositoryPort } from '../../domain/repository/quote-repository.port';
import { QuoteMapper } from '../mapper/quote.mapper';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { UpdateQuoteDto } from '../dto/update-quote.dto';
import { QuoteDto } from '../dto/quote.dto';
import { PROJECT_REPOSITORY_TOKEN, IProjectRepository } from '../../../../project/domain/repository/project-repository.interface';

@Injectable()
export class QuoteService {
  constructor(
    @Inject('QuoteRepositoryPort')
    private readonly quoteRepository: QuoteRepositoryPort,
    @Inject(PROJECT_REPOSITORY_TOKEN)
    private readonly projectRepository: IProjectRepository,
    private readonly quoteMapper: QuoteMapper
  ) {}

  async createQuote(createQuoteDto: CreateQuoteDto): Promise<QuoteDto> {
    const project = await this.projectRepository.findById(createQuoteDto.projectId);
    if (!project) {
      throw new NotFoundException(`Project with id ${createQuoteDto.projectId} not found`);
    }

    const quote = new Quote(
      project,
      createQuoteDto.name,
      createQuoteDto.quoteItems,
      createQuoteDto.dimensioningItems,
      createQuoteDto.totalAmount,
      createQuoteDto.description
    );

    const savedQuote = await this.quoteRepository.save(quote);
    return this.quoteMapper.toDto(savedQuote);
  }

  async updateQuote(id: string, updateQuoteDto: UpdateQuoteDto): Promise<QuoteDto> {
    const quote = await this.quoteRepository.findById(id);
    if (!quote) {
      throw new NotFoundException(`Quote with id ${id} not found`);
    }

    if (updateQuoteDto.name !== undefined) {
      quote.name = updateQuoteDto.name;
    }
    if (updateQuoteDto.description !== undefined) {
      quote.description = updateQuoteDto.description;
    }
    if (updateQuoteDto.quoteItems !== undefined) {
      quote.quoteItems = updateQuoteDto.quoteItems;
    }
    if (updateQuoteDto.dimensioningItems !== undefined) {
      quote.dimensioningItems = updateQuoteDto.dimensioningItems;
    }
    if (updateQuoteDto.totalAmount !== undefined) {
      quote.totalAmount = updateQuoteDto.totalAmount;
    }
    if (updateQuoteDto.status !== undefined) {
      quote.status = updateQuoteDto.status;
    }

    const updatedQuote = await this.quoteRepository.update(quote);
    return this.quoteMapper.toDto(updatedQuote);
  }

  async getQuoteById(id: string): Promise<QuoteDto> {
    const quote = await this.quoteRepository.findById(id);
    if (!quote) {
      throw new NotFoundException(`Quote with id ${id} not found`);
    }
    return this.quoteMapper.toDto(quote);
  }

  async getQuotesByProjectId(projectId: string): Promise<QuoteDto[]> {
    const quotes = await this.quoteRepository.findByProjectId(projectId);
    return this.quoteMapper.toDtoList(quotes);
  }

  async deleteQuote(id: string): Promise<void> {
    const quote = await this.quoteRepository.findById(id);
    if (!quote) {
      throw new NotFoundException(`Quote with id ${id} not found`);
    }
    await this.quoteRepository.delete(id);
  }
} 
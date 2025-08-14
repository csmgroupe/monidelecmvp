import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { QuoteRepositoryPort } from '../../domain/repository/quote-repository.port';
import { Quote } from '../../domain/quote.entity';

@Injectable()
export class QuoteRepository implements QuoteRepositoryPort {
  constructor(private readonly em: EntityManager) {}

  async save(quote: Quote): Promise<Quote> {
    await this.em.persistAndFlush(quote);
    return quote;
  }

  async findById(id: string): Promise<Quote | null> {
    return this.em.findOne(Quote, { id }, {
      populate: ['project']
    });
  }

  async findByProjectId(projectId: string): Promise<Quote[]> {
    return this.em.find(Quote, {
      project: { id: projectId }
    }, {
      populate: ['project'],
      orderBy: { createdAt: 'DESC' }
    });
  }

  async update(quote: Quote): Promise<Quote> {
    await this.em.flush();
    return quote;
  }

  async delete(id: string): Promise<void> {
    const quote = await this.em.findOne(Quote, { id });
    if (quote) {
      await this.em.removeAndFlush(quote);
    }
  }
} 
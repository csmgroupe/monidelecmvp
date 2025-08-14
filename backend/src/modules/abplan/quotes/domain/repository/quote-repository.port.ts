import { Quote } from '../quote.entity';

export interface QuoteRepositoryPort {
  save(quote: Quote): Promise<Quote>;
  findById(id: string): Promise<Quote | null>;
  findByProjectId(projectId: string): Promise<Quote[]>;
  update(quote: Quote): Promise<Quote>;
  delete(id: string): Promise<void>;
} 
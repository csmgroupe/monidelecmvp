import { Injectable } from '@nestjs/common';
import { Quote } from '../../domain/quote.entity';
import { QuoteDto } from '../dto/quote.dto';

@Injectable()
export class QuoteMapper {
  toDto(quote: Quote): QuoteDto {
    return new QuoteDto(
      quote.id,
      quote.project.unwrap().id,
      quote.name,
      quote.quoteItems,
      quote.dimensioningItems,
      quote.totalAmount,
      quote.status,
      quote.createdAt,
      quote.updatedAt,
      quote.description
    );
  }

  toDtoList(quotes: Quote[]): QuoteDto[] {
    return quotes.map(quote => this.toDto(quote));
  }
} 
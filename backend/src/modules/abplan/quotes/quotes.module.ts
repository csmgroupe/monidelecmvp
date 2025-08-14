import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Quote } from './domain/quote.entity';
import { QuoteService } from './application/usecase/quote.service';
import { QuoteController } from './infrastructure/adapter/in/quote.controller';
import { QuoteRepository } from './infrastructure/persistence/quote.repository';
import { QuoteMapper } from './application/mapper/quote.mapper';
import { ProjectModule } from '../../project/project.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Quote]),
    ProjectModule,
    AuthModule,
  ],
  controllers: [QuoteController],
  providers: [
    QuoteMapper,
    {
      provide: 'QuoteRepositoryPort',
      useClass: QuoteRepository,
    },
    QuoteService,
  ],
  exports: [QuoteService],
})
export class QuotesModule {} 
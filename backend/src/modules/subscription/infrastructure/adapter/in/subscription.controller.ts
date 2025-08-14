import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { SubscriptionService } from '../../../application/usecase/subscription.service';
import { CreateSubscriptionDto } from '../../../application/dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../../../application/dto/update-subscription.dto';
import { SubscriptionDto } from '../../../application/dto/subscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async create(
    @Req() request: Request,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionDto> {
    const userId = request['user']?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.subscriptionService.create(userId, createSubscriptionDto);
  }

  @Get()
  async findByUser(@Req() request: Request): Promise<SubscriptionDto | null> {
    const userId = request['user']?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.subscriptionService.findByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SubscriptionDto | null> {
    return this.subscriptionService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDto> {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.subscriptionService.delete(id);
  }

  @Post('cancel')
  async cancel(@Req() request: Request): Promise<SubscriptionDto> {
    const userId = request['user']?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.subscriptionService.cancelSubscription(userId);
  }

  @Post('reactivate')
  async reactivate(@Req() request: Request): Promise<SubscriptionDto> {
    const userId = request['user']?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.subscriptionService.reactivateSubscription(userId);
  }
}

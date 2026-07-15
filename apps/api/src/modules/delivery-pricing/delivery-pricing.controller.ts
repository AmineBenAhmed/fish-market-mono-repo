import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { Public } from '../../common/decorators';
import { DeliveryPricingService } from './delivery-pricing.service';

class CalculateDeliveryFeesDto {
  @IsString()
  customerAreaId!: string;

  @IsArray()
  @IsString({ each: true })
  sellerIds!: string[];
}

@ApiTags('Delivery Pricing')
@Public()
@Controller('delivery-pricing')
export class DeliveryPricingController {
  constructor(private readonly pricingService: DeliveryPricingService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate delivery fees for a set of sellers' })
  @ApiResponse({ status: 200, description: 'Delivery fees per seller' })
  async calculate(@Body() dto: CalculateDeliveryFeesDto) {
    const fees = await this.pricingService.calculateBatch(dto.customerAreaId, dto.sellerIds);
    return { fees };
  }
}

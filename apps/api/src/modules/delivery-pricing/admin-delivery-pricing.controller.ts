import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { DeliveryPricingService } from './delivery-pricing.service';
import { CreateDeliveryPricingDto } from './dto/create-delivery-pricing.dto';
import { UpdateDeliveryPricingDto } from './dto/update-delivery-pricing.dto';

@ApiTags('Admin Delivery Pricing')
@ApiBearerAuth()
@Controller('admin/delivery-pricing')
export class AdminDeliveryPricingController {
  constructor(private readonly pricingService: DeliveryPricingService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create delivery pricing' })
  async create(@Body() dto: CreateDeliveryPricingDto) {
    return this.pricingService.create(dto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all delivery pricing' })
  async findAll() {
    return this.pricingService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get delivery pricing by id' })
  async findOne(@Param('id') id: string) {
    return this.pricingService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update delivery pricing' })
  async update(@Param('id') id: string, @Body() dto: UpdateDeliveryPricingDto) {
    return this.pricingService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete delivery pricing' })
  async remove(@Param('id') id: string) {
    return this.pricingService.remove(id);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('governorates')
  @Public()
  @ApiOperation({ summary: 'List all governorates' })
  @ApiResponse({ status: 200, description: 'Governorate list' })
  async getGovernorates() {
    return this.locationsService.getGovernorates();
  }

  @Get('areas/:governorateId')
  @Public()
  @ApiOperation({ summary: 'List areas by governorate' })
  @ApiResponse({ status: 200, description: 'Area list' })
  async getAreas(@Param('governorateId') governorateId: string) {
    return this.locationsService.getAreas(governorateId);
  }

  @Get('zones/:governorateId/:areaId')
  @Public()
  @ApiOperation({ summary: 'List zones by area' })
  @ApiResponse({ status: 200, description: 'Zone list' })
  async getZones(@Param('governorateId') governorateId: string, @Param('areaId') areaId: string) {
    return this.locationsService.getZones(governorateId, areaId);
  }
}

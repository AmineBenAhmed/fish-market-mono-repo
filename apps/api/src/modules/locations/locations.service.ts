import { Injectable, NotFoundException } from '@nestjs/common';
import {
  getGovernorates,
  getGovernorateById,
  getAreasByGovernorateId,
  getZonesByAreaId,
} from '@fishmarket/shared';

@Injectable()
export class LocationsService {
  getGovernorates() {
    return getGovernorates();
  }

  getAreas(governorateId: string) {
    const gov = getGovernorateById(governorateId);
    if (!gov) throw new NotFoundException('Governorate not found');
    return getAreasByGovernorateId(governorateId);
  }

  getZones(governorateId: string, areaId: string) {
    const gov = getGovernorateById(governorateId);
    if (!gov) throw new NotFoundException('Governorate not found');
    const zones = getZonesByAreaId(governorateId, areaId);
    if (zones.length === 0) throw new NotFoundException('Area not found');
    return zones;
  }
}

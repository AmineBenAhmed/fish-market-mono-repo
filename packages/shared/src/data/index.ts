import locations from './locations.json';
import type { Governorate } from '../types/location';

export const getGovernorates = (): Governorate[] => locations as Governorate[];

export const getGovernorateById = (id: string): Governorate | undefined =>
  (locations as Governorate[]).find((g) => g.id === id);

export const getAreasByGovernorateId = (governorateId: string) =>
  (locations as Governorate[]).find((g) => g.id === governorateId)?.areas ?? [];

export const getAreaById = (governorateId: string, areaId: string) =>
  getAreasByGovernorateId(governorateId).find((a) => a.id === areaId);

export const getZonesByAreaId = (governorateId: string, areaId: string) =>
  getAreaById(governorateId, areaId)?.zones ?? [];

export const getZoneById = (governorateId: string, areaId: string, zoneId: string) =>
  getZonesByAreaId(governorateId, areaId).find((z) => z.id === zoneId);

export interface Zone {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  name: string;
  zones: Zone[];
}

export interface Governorate {
  id: string;
  name: string;
  areas: Area[];
}

export interface NormalizedAddress {
  governorateId: string;
  governorateName: string;
  areaId: string;
  areaName: string;
  zoneId: string;
  zoneName: string;
  street: string;
  buildingNumber?: string;
  apartment?: string;
  floor?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

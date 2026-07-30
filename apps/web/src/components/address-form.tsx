'use client';

import { useState, useEffect } from 'react';
import type { NormalizedAddress } from '@fishmarket/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://api.samak.tn';

interface LocationOption {
  id: string;
  name: string;
}

interface AddressFormValue {
  governorateId: string;
  areaId: string;
  zoneId: string;
  landmark: string;
  label?: string;
  lat?: string;
  lng?: string;
}

interface AddressFormProps {
  value?: Partial<AddressFormValue>;
  onChange: (value: AddressFormValue) => void;
}

export function AddressForm({ value = {}, onChange }: AddressFormProps) {
  const [governorates, setGovernorates] = useState<LocationOption[]>([]);
  const [areas, setAreas] = useState<LocationOption[]>([]);
  const [zones, setZones] = useState<LocationOption[]>([]);
  const [loadingGov, setLoadingGov] = useState(true);

  const form: AddressFormValue = {
    governorateId: value.governorateId || 'sousse',
    areaId: value.areaId || '',
    zoneId: value.zoneId || '',
    landmark: value.landmark || '',
  };

  useEffect(() => {
    fetch(`${API_URL}/api/v1/locations/governorates`)
      .then((r) => r.json())
      .then((res) => setGovernorates(res.data || res))
      .catch(() => {})
      .finally(() => setLoadingGov(false));
  }, []);

  useEffect(() => {
    if (!form.governorateId) {
      setAreas([]);
      setZones([]);
      return;
    }
    fetch(`${API_URL}/api/v1/locations/areas/${form.governorateId}`)
      .then((r) => r.json())
      .then((res) => setAreas(res.data || res))
      .catch(() => setAreas([]));
  }, [form.governorateId]);

  useEffect(() => {
    if (!form.governorateId || !form.areaId) {
      setZones([]);
      return;
    }
    fetch(`${API_URL}/api/v1/locations/zones/${form.governorateId}/${form.areaId}`)
      .then((r) => r.json())
      .then((res) => setZones(res.data || res))
      .catch(() => setZones([]));
  }, [form.governorateId, form.areaId]);

  const update = (patch: Partial<AddressFormValue>) => {
    const next = { ...form, ...patch };

    if (patch.governorateId !== undefined && patch.governorateId !== value.governorateId) {
      next.areaId = '';
      next.zoneId = '';
    }
    if (patch.areaId !== undefined && patch.areaId !== value.areaId) {
      next.zoneId = '';
    }

    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الولاية <span className="text-red-500">*</span>
          </label>
          <select
            value={form.governorateId}
            onChange={(e) => update({ governorateId: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {loadingGov ? (
              <option>جاري التحميل...</option>
            ) : (
              governorates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            المعتمدية <span className="text-red-500">*</span>
          </label>
          <select
            value={form.areaId}
            onChange={(e) => update({ areaId: e.target.value })}
            disabled={!form.governorateId}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">اختر المعتمدية</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">المنطقة</label>
          <select
            value={form.zoneId}
            onChange={(e) => update({ zoneId: e.target.value })}
            disabled={!form.areaId}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">اختر المنطقة (اختياري)</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">أقرب معلم</label>
          <input
            type="text"
            value={form.landmark}
            onChange={(e) => update({ landmark: e.target.value })}
            placeholder="أقرب معلم (اختياري)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export type { AddressFormValue };

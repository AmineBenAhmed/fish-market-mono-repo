import { useState, useEffect } from 'react';

const API_BASE = (() => {
  if (typeof window === 'undefined') return 'http://localhost:4000';
  const origin = window.location.origin;
  if (origin.includes('localhost') || origin.includes('192.168')) {
    return 'http://localhost:4000';
  }
  return origin.replace('/api/v1', '');
})();

interface LocationOption {
  id: string;
  name: string;
}

export interface AddressFormValue {
  governorateId: string;
  areaId: string;
  zoneId: string;
  street: string;
  buildingNumber: string;
  apartment: string;
  floor: string;
  landmark: string;
  label: string;
  lat: string;
  lng: string;
}

interface AddressFormProps {
  value?: Partial<AddressFormValue>;
  onChange: (value: AddressFormValue) => void;
  showLabel?: boolean;
  showCoordinates?: boolean;
}

export function AddressForm({
  value = {},
  onChange,
  showLabel = true,
  showCoordinates = false,
}: AddressFormProps) {
  const [governorates, setGovernorates] = useState<LocationOption[]>([]);
  const [areas, setAreas] = useState<LocationOption[]>([]);
  const [zones, setZones] = useState<LocationOption[]>([]);
  const [loadingGov, setLoadingGov] = useState(true);

  const form: AddressFormValue = {
    governorateId: value.governorateId || 'sousse',
    areaId: value.areaId || '',
    zoneId: value.zoneId || '',
    street: value.street || '',
    buildingNumber: value.buildingNumber || '',
    apartment: value.apartment || '',
    floor: value.floor || '',
    landmark: value.landmark || '',
    label: value.label || '',
    lat: value.lat || '',
    lng: value.lng || '',
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/locations/governorates`)
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
    fetch(`${API_BASE}/api/v1/locations/areas/${form.governorateId}`)
      .then((r) => r.json())
      .then((res) => setAreas(res.data || res))
      .catch(() => setAreas([]));
  }, [form.governorateId]);

  useEffect(() => {
    if (!form.governorateId || !form.areaId) {
      setZones([]);
      return;
    }
    fetch(`${API_BASE}/api/v1/locations/zones/${form.governorateId}/${form.areaId}`)
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          <label className="block text-sm font-medium text-gray-700">
            المنطقة <span className="text-red-500">*</span>
          </label>
          <select
            value={form.zoneId}
            onChange={(e) => update({ zoneId: e.target.value })}
            disabled={!form.areaId}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">اختر المنطقة</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الشارع <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.street}
            onChange={(e) => update({ street: e.target.value })}
            placeholder="اسم الشارع"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">رقم البناية</label>
          <input
            type="text"
            value={form.buildingNumber}
            onChange={(e) => update({ buildingNumber: e.target.value })}
            placeholder="رقم البناية"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">الطابق</label>
          <input
            type="text"
            value={form.floor}
            onChange={(e) => update({ floor: e.target.value })}
            placeholder="رقم الطابق"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">الشقة</label>
          <input
            type="text"
            value={form.apartment}
            onChange={(e) => update({ apartment: e.target.value })}
            placeholder="رقم الشقة"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">أقرب معلم</label>
          <input
            type="text"
            value={form.landmark}
            onChange={(e) => update({ landmark: e.target.value })}
            placeholder="أقرب معلم (اختياري)"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {showLabel && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">تصنيف العنوان</label>
            <select
              value={form.label}
              onChange={(e) => update({ label: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">اختر التصنيف</option>
              <option value="home">المنزل</option>
              <option value="work">العمل</option>
              <option value="family">العائلة</option>
              <option value="other">أخرى</option>
            </select>
          </div>
        )}

        {!showLabel && <div />}
      </div>

      {showCoordinates && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">خط العرض</label>
            <input
              type="text"
              value={form.lat}
              onChange={(e) => update({ lat: e.target.value })}
              placeholder="Latitude"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">خط الطول</label>
            <input
              type="text"
              value={form.lng}
              onChange={(e) => update({ lng: e.target.value })}
              placeholder="Longitude"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}

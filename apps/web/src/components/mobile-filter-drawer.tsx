'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Fish,
  ChevronRight,
  Search,
  Waves,
  Sparkles,
  Egg,
  Shell,
  Ship,
  Droplets,
  Anchor,
  Snowflake,
  Droplet,
  MapPin,
  X,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { useLocale } from '@/stores/locale';
import { useCategories } from '@/hooks/use-categories';
import { fetchGovernorates, fetchAreas } from '@/lib/api';

const categoryIcons = [Fish, Waves, Egg, Shell, Ship, Droplets, Anchor];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileFilterDrawer({ open, onClose }: Props) {
  const categories = useCategories();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const selectedConditions = (searchParams.get('condition') || '').split(',').filter(Boolean);
  const selectedGovernorateId = searchParams.get('governorateId');
  const selectedAreaId = searchParams.get('areaId');
  const [search, setSearch] = useState('');
  const { t } = useLocale();

  const [governorates, setGovernorates] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    fetchGovernorates()
      .then((res) => setGovernorates(res.data || res))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (selectedGovernorateId && open) {
      fetchAreas(selectedGovernorateId)
        .then((res) => setAreas(res.data || res))
        .catch(() => setAreas([]));
    } else {
      setAreas([]);
    }
  }, [selectedGovernorateId, open]);

  const conditionLabels = [
    { value: 'FRESH', label: t('sidebar.fresh'), icon: Droplet, iconClass: 'text-blue-400' },
    { value: 'FROZEN', label: t('sidebar.frozen'), icon: Snowflake, iconClass: 'text-cyan-400' },
    {
      value: 'PREPARED',
      label: t('sidebar.prepared'),
      icon: Sparkles,
      iconClass: 'text-amber-400',
    },
  ] as const;

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
    onClose();
  }

  const handleConditionChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = (params.get('condition') || '').split(',').filter(Boolean);
    const idx = current.indexOf(value);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(value);
    if (current.length > 0) params.set('condition', current.join(','));
    else params.delete('condition');
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  };

  const hasActiveFilters =
    selectedCategory || selectedConditions.length > 0 || selectedGovernorateId || selectedAreaId;

  const clearAll = () => {
    router.push('/');
    onClose();
  };

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-gray-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-lg">Filtres</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain space-y-4 p-4 pb-24">
          {/* ── Location ── */}
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Filtrer par zone
            </p>
            <select
              value={selectedGovernorateId || ''}
              onChange={(e) => {
                const id = e.target.value;
                const params = new URLSearchParams(searchParams.toString());
                params.set('governorateId', id);
                params.delete('areaId');
                router.push(`/?${params.toString()}`);
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              <option value="" disabled>
                {t('sidebar.selectGovernorate')}
              </option>
              {governorates.map((g: any) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              value={selectedAreaId || ''}
              onChange={(e) => {
                const id = e.target.value || null;
                const params = new URLSearchParams(searchParams.toString());
                if (id) params.set('areaId', id);
                else params.delete('areaId');
                router.push(`/?${params.toString()}`);
              }}
              disabled={!selectedGovernorateId}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            >
              <option value="">Sélectionnez une zone</option>
              {areas.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* ── Condition ── */}
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t('sidebar.preservation')}
            </p>
            {conditionLabels.map(({ value, label, icon: Icon, iconClass }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(value)}
                  onChange={() => handleConditionChange(value)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Icon className={`h-4 w-4 ${iconClass}`} />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {/* ── Categories ── */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <div className="divide-y max-h-64 overflow-y-auto">
              <button
                onClick={() => updateParams({ category: null })}
                className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors ${
                  !selectedCategory ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Fish className="h-4 w-4" />
                Toutes les catégories
              </button>
              {filtered.map((cat, idx) => {
                const isActive = selectedCategory === cat.id;
                const IconComp = categoryIcons[idx % categoryIcons.length];
                return (
                  <button
                    key={cat.id}
                    onClick={() => updateParams({ category: cat.id })}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="h-7 w-7 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 shrink-0">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <IconComp className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </div>
                    <span className="flex-1 text-left truncate">{cat.name}</span>
                    {isActive && <ChevronRight className="h-4 w-4 text-blue-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom actions ── */}
        <div className="border-t bg-white p-4 flex gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>
    </>
  );
}

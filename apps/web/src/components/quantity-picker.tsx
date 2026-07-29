'use client';

import { Minus, Plus } from 'lucide-react';

interface Props {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantityPicker({ value, min = 1, max, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="p-1 sm:p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
      >
        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
      <span className="w-7 sm:w-10 text-center font-semibold text-sm sm:text-lg">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="p-1 sm:p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
      >
        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
}

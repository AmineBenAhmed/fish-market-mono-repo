'use client';

import { Fish, LayoutGrid, ChevronRight } from 'lucide-react';
import type { FishCategory } from '@/lib/types';

interface SidebarProps {
  categories: FishCategory[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function Sidebar({ categories, selectedCategory, onSelectCategory }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Categories</h2>
            <p className="text-xs text-gray-400">{categories.length} types</p>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              !selectedCategory
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {!selectedCategory && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-blue-500" />
            )}
            <div
              className={`flex items-center justify-center h-7 w-7 rounded-lg transition-colors duration-200 ${
                !selectedCategory
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500'
              }`}
            >
              <Fish className="h-3.5 w-3.5" />
            </div>
            <span className="flex-1 text-left">All Categories</span>
            <ChevronRight
              className={`h-3.5 w-3.5 transition-all duration-200 ${
                !selectedCategory
                  ? 'text-blue-400 translate-x-0'
                  : 'text-gray-300 -translate-x-1 group-hover:translate-x-0 group-hover:text-gray-400'
              }`}
            />
          </button>

          <div className="h-px bg-gradient-to-r from-gray-100 to-transparent mx-2" />

          <div className="max-h-[calc(100vh-320px)] overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-blue-500" />
                  )}
                  <div
                    className={`flex items-center justify-center h-7 w-7 rounded-lg overflow-hidden transition-all duration-200 ${
                      isActive
                        ? 'ring-2 ring-blue-200'
                        : 'ring-1 ring-gray-100 group-hover:ring-gray-200'
                    }`}
                  >
                    {cat.image?.url ? (
                      <img src={cat.image.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div
                        className={`h-full w-full flex items-center justify-center ${
                          isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Fish className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                  <span className="flex-1 text-left truncate">{cat.name}</span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-all duration-200 ${
                      isActive
                        ? 'text-blue-400 translate-x-0'
                        : 'text-gray-300 -translate-x-1 group-hover:translate-x-0 group-hover:text-gray-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </nav>

        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100/50 p-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Fish className="h-4 w-4" />
            <span className="text-xs font-semibold">Fresh daily</span>
          </div>
          <p className="text-xs text-blue-500/70 mt-1 leading-relaxed">
            Sourced directly from local fishermen
          </p>
        </div>
      </div>
    </aside>
  );
}

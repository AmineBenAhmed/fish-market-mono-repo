'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  Fish,
  LayoutGrid,
  ChevronRight,
  Search,
  Waves,
  Sparkles,
  Egg,
  Shell,
  Ship,
  Droplets,
  Anchor,
} from 'lucide-react';
import type { FishCategory } from '@/lib/types';

const categoryIcons = [Fish, Waves, Egg, Shell, Ship, Droplets, Anchor];

interface SidebarProps {
  categories: FishCategory[];
}

export function Sidebar({ categories }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const [search, setSearch] = useState('');

  function handleSelect(id: string | null) {
    const qs = id ? `?category=${id}` : '';
    router.push(`/${qs}`);
  }

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <aside className="w-72 shrink-0 hidden lg:block ml-8">
      <div className="sticky top-24 space-y-5">
        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-5 shadow-lg shadow-blue-200/50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10 blur-lg" />
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-sm font-bold tracking-tight">Categories</h2>
              <p className="text-xs text-white/70 font-medium">{categories.length} types</p>
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-colors group-focus-within:text-blue-500" />
          <input
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xs font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Category List ── */}
        <nav className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="max-h-[calc(100vh-420px)] overflow-y-auto overscroll-contain divide-y divide-gray-50">
            {/* All Categories */}
            <div className="px-2 pt-2 pb-1">
              <button
                onClick={() => handleSelect(null)}
                className={`group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {!selectedCategory && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-gradient-to-b from-blue-500 to-cyan-400 shadow-sm shadow-blue-200" />
                )}
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200 ${
                    !selectedCategory
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-200'
                      : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500'
                  }`}
                >
                  <Fish className="h-4 w-4" />
                </div>
                <span className="flex-1 text-left font-semibold">All Categories</span>
                <span className="text-xs text-gray-400 tabular-nums bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                  {categories.length}
                </span>
              </button>
            </div>

            {/* Category Items */}
            <div className="px-2 py-1 space-y-0.5">
              {filtered.map((cat, idx) => {
                const isActive = selectedCategory === cat.id;
                const IconComp = categoryIcons[idx % categoryIcons.length];

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.id)}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-blue-500 to-cyan-400 shadow-sm shadow-blue-200" />
                    )}
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-xl overflow-hidden transition-all duration-200 ${
                        isActive
                          ? 'ring-2 ring-blue-200 ring-offset-1 ring-offset-blue-50 shadow-sm'
                          : 'ring-1 ring-gray-100 group-hover:ring-gray-200'
                      }`}
                    >
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div
                          className={`h-full w-full flex items-center justify-center transition-colors ${
                            isActive
                              ? 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600'
                              : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <span className="flex-1 text-left truncate">{cat.name}</span>
                    {isActive ? (
                      <ChevronRight className="h-4 w-4 text-blue-400 animate-pulse" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    )}
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="px-6 py-10 text-center">
                <Search className="h-6 w-6 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No categories match</p>
                <button
                  onClick={() => setSearch('')}
                  className="text-xs text-blue-500 hover:text-blue-600 mt-1 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* ── Footer ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100/60 p-5 group cursor-default">
          <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-emerald-200/30 blur-xl group-hover:bg-emerald-200/40 transition-all duration-500" />
          <div className="absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-cyan-200/30 blur-lg group-hover:bg-cyan-200/40 transition-all duration-500" />
          <div className="relative flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-sm shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Fresh daily</p>
              <p className="text-xs text-emerald-600/70 mt-0.5 leading-relaxed">
                Sourced directly from local fishermen along the coast
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

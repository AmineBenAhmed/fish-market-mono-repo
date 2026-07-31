import { Fish } from 'lucide-react';
import type { FishCategory } from '@/lib/types';

interface CategoryCardProps {
  category: FishCategory;
  onClick: (id: string) => void;
  small?: boolean;
}

export function CategoryCard({ category, onClick, small }: CategoryCardProps) {
  return (
    <button
      onClick={() => onClick(category.id)}
      className={`group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 active:scale-95 sm:active:scale-100 ${
        small ? '' : ''
      }`}
    >
      <div className={`bg-gray-100 overflow-hidden ${small ? 'aspect-square' : 'aspect-[4/3]'}`}>
        {category.image?.url ? (
          <img
            src={category.image.url}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Fish className={small ? 'h-6 w-6' : 'h-10 w-10 sm:h-16 sm:w-16'} />
          </div>
        )}
      </div>
      <div
        className={`flex items-end justify-between gap-1 ${small ? 'py-1.5 px-1.5' : 'py-2 sm:py-3 px-1.5 sm:px-3'}`}
      >
        <p
          className={`font-medium text-gray-500 truncate ${small ? 'text-[10px] max-w-[45%]' : 'text-xs sm:text-base max-w-[45%] sm:max-w-[50%]'}`}
        >
          {category.nameFr || ''}
        </p>
        <h3
          className={`font-bold text-gray-900 text-right truncate ${small ? 'text-[11px] max-w-[55%]' : 'text-sm sm:text-lg max-w-[55%] sm:max-w-[50%]'}`}
        >
          {category.name}
        </h3>
      </div>
    </button>
  );
}

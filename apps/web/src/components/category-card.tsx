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
      <div className={`text-center ${small ? 'py-1.5 px-1' : 'py-2 sm:py-4 px-1.5 sm:px-2'}`}>
        <h3
          className={`font-bold text-gray-900 leading-tight ${small ? 'text-[11px]' : 'text-sm sm:text-xl sm:leading-normal'}`}
        >
          {category.name}
        </h3>
      </div>
    </button>
  );
}

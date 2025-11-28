import React from 'react';
import type { Category } from '../../types/menu/types';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
          selectedCategoryId === null
            ? 'text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        style={selectedCategoryId === null ? { backgroundColor: '#FF8108' } : {}}
        onMouseEnter={(e) => {
          if (selectedCategoryId !== null) {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedCategoryId !== null) {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
          }
        }}
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
            selectedCategoryId === category.id
              ? 'text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={selectedCategoryId === category.id ? { backgroundColor: '#FF8108' } : {}}
          onMouseEnter={(e) => {
            if (selectedCategoryId !== category.id) {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCategoryId !== category.id) {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }
          }}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default ProductFilters;


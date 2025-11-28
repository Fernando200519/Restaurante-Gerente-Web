import React from 'react';
import type { Product } from '../../types/menu/types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const hasImage = Boolean(product.imageUrl);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      {/* Área de imagen superior (siempre presente con placeholder) */}
      <div className="relative w-full bg-gray-100 aspect-video">
        {hasImage ? (
          <img
            src={product.imageUrl!}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Si la imagen falla, mostrar placeholder
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement as HTMLElement;
              if (parent) parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400">\n  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M21 15l-5-5L5 21"></path></svg>\n</div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <path d="M21 15l-5-5L5 21"></path>
            </svg>
          </div>
        )}
        {/* Badge de estado overlay */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap bg-white/85 backdrop-blur-sm shadow-sm ${
              product.status === 'activo' ? 'text-green-700' : 'text-gray-700'
            }`}
          >
            {product.status === 'activo' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Cuerpo del contenido */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2 line-clamp-2 capitalize">{product.name}</h3>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-500">
            Categoría: <span className="text-gray-700 font-medium">{product.categoryName || 'Sin categoría'}</span>
          </p>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold" style={{ color: '#FF8108' }}>
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Footer de acciones */}
      <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button
          onClick={() => onEdit(product)}
          className="w-10 h-10 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-200 hover:text-primary transition-colors"
            aria-label="Editar producto"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
          onClick={() => onDelete(product.id)}
          className="w-10 h-10 flex items-center justify-center rounded-md text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
            aria-label="Eliminar producto"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
    </div>
  );
};

export default ProductCard;


import React from 'react';

interface MenuTabsProps {
  activeTab: 'categories' | 'products';
  onTabChange: (tab: 'categories' | 'products') => void;
}

const MenuTabs: React.FC<MenuTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-1 border-b border-gray-200 mb-6">
      <button
        onClick={() => onTabChange('categories')}
        className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
          activeTab === 'categories'
            ? 'text-primary'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Categorías
        {activeTab === 'categories' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
        )}
      </button>
      <button
        onClick={() => onTabChange('products')}
        className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
          activeTab === 'products'
            ? 'text-primary'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Productos
        {activeTab === 'products' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
        )}
      </button>
    </div>
  );
};

export default MenuTabs;


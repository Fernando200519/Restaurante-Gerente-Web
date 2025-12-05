import React from 'react';

interface AddCategoryButtonProps {
  onClick: () => void;
}

const AddCategoryButton: React.FC<AddCategoryButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
      style={{ backgroundColor: '#FF8108' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FA9623'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF8108'}
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
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>Agregar categoría</span>
    </button>
  );
};

export default AddCategoryButton;


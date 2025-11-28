import React from 'react';

interface AddEmployeeButtonProps {
  onClick: () => void;
}

const AddEmployeeButton: React.FC<AddEmployeeButtonProps> = ({ onClick }) => {
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
      <span>Agregar nuevo empleado</span>
    </button>
  );
};

export default AddEmployeeButton;


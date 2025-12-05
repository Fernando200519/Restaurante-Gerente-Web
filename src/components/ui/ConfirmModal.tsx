import React from 'react';
import BaseModal from './BaseModal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'red' | 'orange' | 'blue' | 'green';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'red',
}) => {
  const handleConfirm = () => {
    console.log('ConfirmModal: handleConfirm llamado');
    console.log('onConfirm:', onConfirm);
    console.log('onClose:', onClose);
    onConfirm();
    onClose();
  };
  
  const handleCancel = () => {
    console.log('ConfirmModal: handleCancel llamado');
    console.log('onClose:', onClose);
    onClose();
  };

  const getConfirmButtonStyle = () => {
    const baseStyle = 'px-6 py-2 text-white font-semibold rounded-lg transition-colors';
    switch (confirmColor) {
      case 'red':
        return `${baseStyle} bg-red-600 hover:bg-red-700`;
      case 'orange':
        return `${baseStyle}`;
      case 'blue':
        return `${baseStyle} bg-blue-600 hover:bg-blue-700`;
      case 'green':
        return `${baseStyle} bg-green-600 hover:bg-green-700`;
      default:
        return `${baseStyle} bg-red-600 hover:bg-red-700`;
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-gray-700 text-lg">{message}</p>
        
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={confirmColor === 'orange' 
              ? getConfirmButtonStyle() + ' bg-[#FF8108] hover:bg-[#FA9623]'
              : getConfirmButtonStyle()
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;


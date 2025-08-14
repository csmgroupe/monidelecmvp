import { AlertTriangle, X } from 'lucide-react';

interface ConfirmRecalculateDimensioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmRecalculateDimensioningModal({ isOpen, onClose, onConfirm }: ConfirmRecalculateDimensioningModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-amber-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Recalculer le dimensionnement
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                Cette action va recalculer entièrement le dimensionnement à partir des équipements 
                définis dans les étapes précédentes.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-800 font-medium text-sm">
                      Attention
                    </p>
                    <p className="text-amber-700 text-sm mt-1">
                      Toutes vos modifications manuelles (disjoncteurs, tableaux, câbles, parafoudres) 
                      seront définitivement perdues.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm">
                Cette action est utile si vous avez modifié des équipements dans les étapes précédentes 
                et souhaitez mettre à jour le dimensionnement automatiquement.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Recalculer le dimensionnement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
import { FileText, Save, Clock } from 'lucide-react';

interface QuoteFooterProps {
  totalAmount: number;
  isSaving?: boolean;
  showSaveStatus?: boolean;
}

export function QuoteFooter({ totalAmount, isSaving, showSaveStatus }: QuoteFooterProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-green-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Montant total estimé :</span>
          </div>
          <span className="text-3xl font-bold text-green-900">
            {totalAmount.toFixed(2)} € HT
          </span>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="text-sm text-green-700">
            TVA (20%) : {(totalAmount * 0.2).toFixed(2)} € • Total TTC : {(totalAmount * 1.2).toFixed(2)} €
          </div>
          {showSaveStatus && (
            <div className="flex items-center text-sm">
              {isSaving ? (
                <>
                  <Clock className="w-4 h-4 mr-1 text-blue-600 animate-spin" />
                  <span className="text-blue-600">Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1 text-green-600" />
                  <span className="text-green-600">Sauvegardé</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
import { Euro, Plus, Download, Calculator, RefreshCw } from 'lucide-react';

interface QuoteHeaderProps {
  totalAmount: number;
  onAddItem: () => void;
  onExportCSV?: () => void;
  onRecalculate?: () => void;
}

export function QuoteHeader({ totalAmount, onAddItem, onExportCSV, onRecalculate }: QuoteHeaderProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Euro className="w-5 h-5 mr-2 text-gray-500" />
            Montant total estimé
          </h3>
          <div className="flex items-center space-x-3">
            {onRecalculate && (
              <button
                onClick={onRecalculate}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700"
                title="Recalculer les estimations à partir des équipements et du dimensionnement"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalculer
              </button>
            )}
            <button
              onClick={onExportCSV}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </button>
          </div>
        </div>
      </div>
      
      {/* Résumé financier */}
      <div className="px-6 py-4 bg-blue-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Calculator className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Total estimé :</span>
          </div>
          <span className="text-2xl font-bold text-blue-900">
            {totalAmount.toFixed(2)} € HT
          </span>
        </div>
      </div>
    </div>
  );
} 
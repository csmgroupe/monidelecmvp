import { Cable, Edit2, Save, X, Trash2, Plus } from 'lucide-react';
import type { DimensioningQuoteItem } from './types';
import { CableSelect } from './CableSelect';
import { CABLE_REFERENCES } from './reference-configs';

interface CablesTableProps {
  items: DimensioningQuoteItem[];
  editingItemId: string | null;
  onEditItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<DimensioningQuoteItem>) => void;
  onDeleteItem: (id: string) => void;
  onSaveItem: () => void;
  onCancelEdit: () => void;
  onAddItem: () => void;
}

export function CablesTable({
  items,
  editingItemId,
  onEditItem,
  onUpdateItem,
  onDeleteItem,
  onSaveItem,
  onCancelEdit,
  onAddItem,
}: CablesTableProps) {
  const cables = items.filter(item => item.type === 'cable');
  
  if (cables.length === 0) return null;

  const getCableLabel = (reference: string): string => {
    // Search through all cable references to find the matching one
    for (const [, cables] of Object.entries(CABLE_REFERENCES)) {
      const cable = cables.find(c => c.value === reference);
      if (cable) {
        return cable.label;
      }
    }
    return reference; // Fallback to reference if label not found
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-900 flex items-center">
            <Cable className="w-4 h-4 mr-2 text-gray-500" />
            Câbles estimés
          </h4>
          <button
            onClick={onAddItem}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type et section
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix au mètre
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Longueur (m)
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {cables.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  {editingItemId === item.id ? (
                    <input
                      type="text"
                      value={item.intitule}
                      onChange={(e) => onUpdateItem(item.id, { intitule: e.target.value })}
                      className="w-full px-2 py-1 text-sm border rounded"
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium">{item.intitule}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingItemId === item.id ? (
                    <CableSelect
                      value={item.reference_principal}
                      onChange={(value, price, section) => {
                        const updates: Partial<DimensioningQuoteItem> = { 
                          reference_principal: value,
                          section: section === 'RJ45' || section === 'Coaxial' ? 0 : parseFloat(section || '2.5')
                        };
                        if (price !== undefined) {
                          updates.prix = price;
                        }
                        onUpdateItem(item.id, updates);
                      }}
                      className="w-full"
                    />
                  ) : (
                    <span className="text-blue-600 font-mono text-xs">{getCableLabel(item.reference_principal)}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium">{item.prix.toFixed(2)} €</span>
                </td>
                <td className="px-4 py-2">
                  {editingItemId === item.id ? (
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-2 py-1 text-sm border rounded"
                      min="1"
                    />
                  ) : (
                    <span>{item.quantity} m</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium">{(item.prix * item.quantity).toFixed(2)} €</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    {editingItemId === item.id ? (
                      <>
                        <button
                          onClick={onSaveItem}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Sauvegarder"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title="Annuler"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onEditItem(item.id)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
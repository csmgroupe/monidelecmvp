import React from 'react';
import { Zap, Edit2, Save, X, Trash2, Plus, Shield } from 'lucide-react';
import type { DimensioningQuoteItem } from './types';
import { CircuitBreakerSelect } from './CircuitBreakerSelect';
import { DifferentialCircuitBreakerSelect } from './DifferentialCircuitBreakerSelect';
import { CIRCUIT_BREAKER_REFERENCES, DIFFERENTIAL_CIRCUIT_BREAKER_REFERENCES } from './reference-configs';

interface CircuitBreakersTableProps {
  items: DimensioningQuoteItem[];
  editingItemId: string | null;
  onEditItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<DimensioningQuoteItem>) => void;
  onDeleteItem: (id: string) => void;
  onSaveItem: () => void;
  onCancelEdit: () => void;
  onAddItem: () => void;
  onRecalculateDDR: () => void;
}

export function CircuitBreakersTable({
  items,
  editingItemId,
  onEditItem,
  onUpdateItem,
  onDeleteItem,
  onSaveItem,
  onCancelEdit,
  onAddItem,
  onRecalculateDDR,
}: CircuitBreakersTableProps) {
  const circuitBreakers = items.filter(item => item.type === 'circuit_breaker');
  const differentialBreakers = items.filter(item => item.type === 'differential_circuit_breaker');
  
  if (circuitBreakers.length === 0) return null;

  const getCircuitBreakerLabel = (reference: string): string => {
    // Search through all circuit breaker references to find the matching one
    for (const [, breakers] of Object.entries(CIRCUIT_BREAKER_REFERENCES)) {
      const breaker = breakers.find(b => b.value === reference);
      if (breaker) {
        return breaker.label;
      }
    }
    return reference; // Fallback to reference if label not found
  };

  const getDifferentialCircuitBreakerLabel = (reference: string): string => {
    for (const [, breakers] of Object.entries(DIFFERENTIAL_CIRCUIT_BREAKER_REFERENCES)) {
      const breaker = breakers.find(b => b.value === reference);
      if (breaker) {
        return breaker.label;
      }
    }
    return reference;
  };

  // Grouper les disjoncteurs par rangées (max 8 modules)
  const groupCircuitBreakersByRows = (): Array<{ row: number; breakers: DimensioningQuoteItem[]; ddr?: DimensioningQuoteItem }> => {
    const rows: Array<{ row: number; breakers: DimensioningQuoteItem[]; ddr?: DimensioningQuoteItem }> = [];
    const maxModulesPerRow = 8;
    
    let currentRow: DimensioningQuoteItem[] = [];
    let currentRowModules = 0;
    let rowNumber = 1;
    
    for (const breaker of circuitBreakers) {
      // Chaque disjoncteur prend 1 module (sauf les 40A et 63A qui prennent 2 modules)
      const breakerModules = (breaker.rating && (breaker.rating === 40 || breaker.rating === 63)) ? 2 : 1;
      
      // Si ajouter ce disjoncteur dépasse 8 modules, commencer une nouvelle rangée
      if (currentRowModules + breakerModules > maxModulesPerRow && currentRow.length > 0) {
        const ddr = differentialBreakers.find(d => d.rowId === `row-${rowNumber}`);
        rows.push({ row: rowNumber, breakers: [...currentRow], ddr });
        currentRow = [];
        currentRowModules = 0;
        rowNumber++;
      }
      
      currentRow.push(breaker);
      currentRowModules += breakerModules;
    }
    
    // Ajouter la dernière rangée s'il y a des disjoncteurs
    if (currentRow.length > 0) {
      const ddr = differentialBreakers.find(d => d.rowId === `row-${rowNumber}`);
      rows.push({ row: rowNumber, breakers: currentRow, ddr });
    }
    
    return rows;
  };

  const calculateRowSummary = (breakers: DimensioningQuoteItem[]): { totalRating: number; adjustedRating: number; recommendedDDR: number } => {
    const totalRating = breakers.reduce((sum, breaker) => sum + (Number(breaker.rating) || 0), 0);
    const adjustedRating = Math.ceil(totalRating * 0.7);
    
    let recommendedDDR: number;
    if (adjustedRating <= 25) {
      recommendedDDR = 25;
    } else if (adjustedRating <= 40) {
      recommendedDDR = 40;
    } else {
      recommendedDDR = 63;
    }
    
    return { totalRating, adjustedRating, recommendedDDR };
  };

  const rowsData = groupCircuitBreakersByRows();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-900 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-gray-500" />
            Disjoncteurs par rangée
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={onRecalculateDDR}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Shield className="w-4 h-4" />
              Actualiser DDR
            </button>
            <button
              onClick={onAddItem}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Calibre (A)
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix unitaire
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm">
            {rowsData.map((rowData, rowIndex) => {
              const rowSummary = calculateRowSummary(rowData.breakers);
              return (
                <React.Fragment key={`row-${rowData.row}`}>
                  {/* Ligne de séparation de rangée */}
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td colSpan={7} className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-900">
                          Rangée {rowData.row} ({rowData.breakers.length} disjoncteur{rowData.breakers.length > 1 ? 's' : ''})
                        </span>
                        <div className="text-sm text-blue-700">
                          Σ calibres: {rowSummary.totalRating}A • 
                          Coeff. 0.7: {rowSummary.adjustedRating}A • 
                          DDR recommandé: {rowSummary.recommendedDDR}A
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Disjoncteurs de la rangée */}
                  {rowData.breakers.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 pl-8">
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
                          <CircuitBreakerSelect
                            value={item.reference_principal}
                            onChange={(value: string, price?: number, rating?: number) => {
                              const updates: Partial<DimensioningQuoteItem> = { 
                                reference_principal: value,
                                rating: rating
                              };
                              if (price !== undefined) {
                                updates.prix = price;
                              }
                              onUpdateItem(item.id, updates);
                            }}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-blue-600 font-mono text-xs">{getCircuitBreakerLabel(item.reference_principal)}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span>{item.rating}A</span>
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
                          <span>{item.quantity}</span>
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

                  {/* Ligne DDR pour la rangée */}
                  {rowData.ddr ? (
                    <tr className="bg-green-50 border-b border-green-200">
                      <td className="px-4 py-2 pl-8">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-green-600" />
                          {editingItemId === rowData.ddr.id ? (
                            <input
                              type="text"
                              value={rowData.ddr.intitule}
                              onChange={(e) => rowData.ddr && onUpdateItem(rowData.ddr.id, { intitule: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded"
                              autoFocus
                            />
                          ) : (
                            <span className="font-medium text-green-800">{rowData.ddr.intitule}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {editingItemId === rowData.ddr.id ? (
                          <DifferentialCircuitBreakerSelect
                            value={rowData.ddr.reference_principal}
                            onChange={(value: string, price?: number, rating?: number) => {
                              if (!rowData.ddr) return;
                              const updates: Partial<DimensioningQuoteItem> = { 
                                reference_principal: value,
                                rating: rating
                              };
                              if (price !== undefined) {
                                updates.prix = price;
                              }
                              onUpdateItem(rowData.ddr.id, updates);
                            }}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-green-600 font-mono text-xs">{getDifferentialCircuitBreakerLabel(rowData.ddr.reference_principal)}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-green-800 font-medium">{rowData.ddr.rating}A</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="font-medium">{rowData.ddr.prix.toFixed(2)} €</span>
                      </td>
                      <td className="px-4 py-2">
                        <span>{rowData.ddr.quantity}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="font-medium">{(rowData.ddr.prix * rowData.ddr.quantity).toFixed(2)} €</span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          {editingItemId === rowData.ddr.id ? (
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
                                onClick={() => rowData.ddr && onEditItem(rowData.ddr.id)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Modifier DDR"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr className="bg-yellow-50 border-b border-yellow-200">
                      <td colSpan={7} className="px-4 py-2 pl-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-yellow-800">
                            <Shield className="w-4 h-4 mr-2" />
                            <span className="text-sm">DDR non configuré pour cette rangée</span>
                          </div>
                          <div className="text-xs text-yellow-600">
                            Utilisez "Actualiser DDR" pour régénérer
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
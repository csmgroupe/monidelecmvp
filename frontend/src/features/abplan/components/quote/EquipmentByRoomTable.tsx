import { Building2, Edit2, Save, X, Trash2, Plus } from 'lucide-react';
import type { QuoteItem, QuoteItemsByRoom } from './types';
import type { Room } from '../../types';
import { PlateSelect } from './PlateSelect';
import { EquipmentTypeSelect } from './EquipmentTypeSelect';
import { getReferencesByType, getEnclosureBoxFromEquipment, getPlatePrice, getEnclosureBoxPrice, EQUIPMENT_REFERENCES } from './reference-configs';

interface EquipmentByRoomTableProps {
  itemsByRoom: QuoteItemsByRoom;
  rooms: Room[];
  editingItem: string | null;
  onEditItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<QuoteItem>) => void;
  onDeleteItem: (id: string) => void;
  onSaveItem: () => void;
  onCancelEdit: () => void;
  onAddItem: (roomId?: string) => void;
}

export function EquipmentByRoomTable({
  itemsByRoom,
  rooms,
  editingItem,
  onEditItem,
  onUpdateItem,
  onDeleteItem,
  onSaveItem,
  onCancelEdit,
  onAddItem,
}: EquipmentByRoomTableProps) {
  
  const handleEquipmentTypeChange = (itemId: string, equipmentType: string, defaultReference: string) => {
    const references = getReferencesByType('equipment', equipmentType);
    if (references.length > 0) {
      const ref = references.find(r => r.value === defaultReference);
      if (ref) {
        const enclosureBox = getEnclosureBoxFromEquipment(defaultReference, equipmentType);
        
        // Définir la plaque blanche par défaut selon le type d'équipement
        let defaultWhitePlate = '';
        const isDoubleEquipment = ['DoubleSocket', 'DoubleSwitch'].includes(equipmentType);
        if (isDoubleEquipment) {
          defaultWhitePlate = 'SCHS520704'; // Plaque double blanche
        } else {
          defaultWhitePlate = 'SCHS520702'; // Plaque simple blanche
        }
        
        onUpdateItem(itemId, {
          equipmentType: equipmentType,
          reference_principal: ref.value,
          prix: ref.price || 0,
          boite_encastrement: enclosureBox?.reference || '',
          plaque_blanche: defaultWhitePlate,
          plaque_noir: '' // Reset la plaque noire
        });
      }
    }
  };

  // Fonction pour calculer le prix total d'un item (équipement + plaque + boîte)
  const calculateItemTotal = (item: QuoteItem): number => {
    const equipmentPrice = item.prix || 0;
    const whitePlatePrice = getPlatePrice(item.plaque_blanche);
    const blackPlatePrice = getPlatePrice(item.plaque_noir);
    const enclosurePrice = getEnclosureBoxPrice(item.boite_encastrement);
    
    return (equipmentPrice + whitePlatePrice + blackPlatePrice + enclosurePrice) * item.quantity;
  };

  // Helper function to check if any item has plaques
  const hasPlaquesInRoom = (roomItems: QuoteItem[]) => {
    return roomItems.some(item => 
      (item.plaque_blanche && item.plaque_blanche.trim() !== '') ||
      (item.plaque_noir && item.plaque_noir.trim() !== '')
    );
  };

  const getEquipmentLabel = (reference: string, equipmentType: string): string => {
    if (!equipmentType) return reference;
    const references = EQUIPMENT_REFERENCES[equipmentType];
    if (!references) return reference;
    const ref = references.find(r => r.value === reference);
    return ref ? ref.label : reference;
  };

  return (
    <>
      {rooms.map(room => {
        const roomId = room.id?.toString() || '';
        const roomItems = itemsByRoom.grouped[roomId] || [];
        const showPlaques = hasPlaquesInRoom(roomItems);
        
        return (
        <div key={room.id || roomId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                {room.name || `Pièce ${room.id}`}
              </h4>
              <button
                onClick={() => onAddItem(roomId)}
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
                    Intitulé
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence principal
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix équipement
                  </th>
                  {showPlaques && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plaque
                    </th>
                  )}
                  {showPlaques && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix plaque
                    </th>
                  )}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boîte encastrement
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix boîte
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qté
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
                {roomItems.length > 0 ? roomItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          value={item.intitule}
                          onChange={(e) => onUpdateItem(item.id, { intitule: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded"
                          autoFocus
                          placeholder="Nom de l'équipement"
                        />
                      ) : (
                        <span className="font-medium">{item.intitule}</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingItem === item.id ? (
                        <EquipmentTypeSelect
                          value={item.equipmentType || ''}
                          onChange={(equipmentType, defaultReference) => 
                            handleEquipmentTypeChange(item.id, equipmentType, defaultReference)
                          }
                          className="w-full"
                        />
                      ) : (
                        <span className="text-blue-600 font-mono text-xs">{getEquipmentLabel(item.reference_principal, item.equipmentType || '')}</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-medium">{item.prix.toFixed(2)} €</span>
                    </td>
                    {showPlaques && (
                      <td className="px-4 py-2">
                        {editingItem === item.id ? (
                          <PlateSelect
                            whitePlateValue={item.plaque_blanche}
                            blackPlateValue={item.plaque_noir}
                            onChange={(whitePlate, blackPlate) => 
                              onUpdateItem(item.id, { 
                                plaque_blanche: whitePlate,
                                plaque_noir: blackPlate 
                              })
                            }
                            subType={['DoubleSocket', 'DoubleSwitch'].includes(item.equipmentType || '') ? 'double' : 'simple'}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-gray-600 font-mono text-xs">
                            {item.plaque_blanche && item.plaque_blanche.trim() !== '' && (
                              <span>{item.plaque_blanche} - blanche</span>
                            )}
                            {item.plaque_noir && item.plaque_noir.trim() !== '' && (
                              <span>{item.plaque_noir} - noire</span>
                            )}
                            {(!item.plaque_blanche || item.plaque_blanche.trim() === '') && 
                             (!item.plaque_noir || item.plaque_noir.trim() === '') && (
                              <span className="text-gray-400">-</span>
                            )}
                          </span>
                        )}
                      </td>
                    )}
                    {showPlaques && (
                      <td className="px-4 py-2">
                        <span className="font-medium">
                          {(getPlatePrice(item.plaque_blanche) + getPlatePrice(item.plaque_noir)).toFixed(2)} €
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-2">
                      <span className="text-gray-600 font-mono text-xs">{item.boite_encastrement}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-medium">{getEnclosureBoxPrice(item.boite_encastrement).toFixed(2)} €</span>
                    </td>
                    <td className="px-4 py-2">
                      {editingItem === item.id ? (
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
                      <span className="font-medium">{calculateItemTotal(item).toFixed(2)} €</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        {editingItem === item.id ? (
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
                )) : (
                  <tr>
                    <td colSpan={showPlaques ? 10 : 8} className="px-4 py-8 text-center text-gray-500">
                      Aucun équipement dans cette pièce. Cliquez sur "Ajouter" pour en ajouter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        );
      })}
    </>
  );
} 
import type { Equipment } from '../../abplan/types';
import type { ProjectEquipmentDto } from '../../../api/generated/ProjectEquipments';

export function equipmentsToBackend(equipments: Equipment[]): ProjectEquipmentDto[] {
  return equipments.map(equipment => ({
    id: equipment.id,
    name: equipment.name,
    quantity: equipment.quantity,
    roomId: equipment.roomId,
    category: 'equipment' as const,
    type: equipment.type,
    metadata: equipment.metadata
  }));
}

export function equipmentsFromBackend(backendEquipments: ProjectEquipmentDto[]): Equipment[] {
  return backendEquipments
    .filter(eq => eq.category === 'equipment')
    .map(equipment => ({
      id: equipment.id || `${Date.now()}_${Math.random()}`,
      name: equipment.name,
      quantity: equipment.quantity,
      roomId: equipment.roomId || '',
      type: equipment.type,
      metadata: equipment.metadata
    }));
} 
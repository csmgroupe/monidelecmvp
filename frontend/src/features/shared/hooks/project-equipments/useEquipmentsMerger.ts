import { useCallback } from 'react';
import { ProjectEquipmentDto } from '@/api/generated/ProjectEquipments';
import { equipmentsToBackend } from '../../utils/equipmentsToBackend';
import { optionsToEquipments } from '../../utils/optionsToEquipments';
import type { Equipment } from '@/features/abplan/types';
import type { ProjectOptions } from '@/features/abplan/types';

/**
 * Hook to safely merge room equipments and option equipments
 * Prevents race conditions by ensuring proper data fusion and deduplication
 */
export const useEquipmentsMerger = () => {

  /**
   * Deduplicate equipments by roomId, category, type and name
   * For room equipments (category: 'equipment'), sums quantities
   * For option equipments (category: 'option'), keeps the one with highest quantity or most recent data
   */
  const deduplicateEquipments = useCallback((equipments: ProjectEquipmentDto[]): ProjectEquipmentDto[] => {
    if (!equipments || equipments.length === 0) return [];

    const equipmentMap = new Map<string, ProjectEquipmentDto>();
    let duplicatesFound = 0;

    equipments.forEach((equipment) => {
      const key = `${equipment.roomId || 'no-room'}-${equipment.category}-${equipment.type || 'no-type'}-${equipment.name}`;

      if (equipmentMap.has(key)) {
        duplicatesFound++;
        const existing = equipmentMap.get(key)!;
        
        // For room equipments, sum the quantities
        if (equipment.category === 'equipment') {
          existing.quantity = (existing.quantity || 0) + (equipment.quantity || 0);
          console.debug(`[EquipmentsMerger] Merging room equipment quantities`, { 
            key, 
            existingQuantity: existing.quantity - (equipment.quantity || 0),
            addedQuantity: equipment.quantity,
            newTotal: existing.quantity
          });
        } else {
          // For option equipments, keep the one with better data (has ID or higher quantity)
          if (equipment.id || (equipment.quantity || 0) > (existing.quantity || 0)) {
            equipmentMap.set(key, equipment);
            console.debug(`[EquipmentsMerger] Replacing option equipment`, { key });
          }
        }
      } else {
        // First occurrence, just add it
        equipmentMap.set(key, { ...equipment });
      }
    });

    const result = Array.from(equipmentMap.values());

    if (duplicatesFound > 0) {
      console.info(`[EquipmentsMerger] Deduplication complete`, {
        originalCount: equipments.length,
        duplicatesFound,
        finalCount: result.length,
      });
    }

    return result;
  }, []);

  /**
   * Validate equipments data for potential issues
   * Logs warnings but doesn't modify the data
   */
  const validateEquipments = useCallback((equipments: ProjectEquipmentDto[], context: string = 'unknown'): void => {
    if (!equipments || equipments.length === 0) return;

    const issues: string[] = [];
    const roomEquipments = equipments.filter(eq => eq.category === 'equipment');
    const optionEquipments = equipments.filter(eq => eq.category === 'option');

    // Check for room equipments without roomId
    const roomEquipmentsWithoutRoomId = roomEquipments.filter(eq => !eq.roomId);
    if (roomEquipmentsWithoutRoomId.length > 0) {
      issues.push(`${roomEquipmentsWithoutRoomId.length} room equipment(s) without roomId`);
    }

    // Check for equipments with zero quantity
    const zeroQuantityEquipments = equipments.filter(eq => eq.quantity <= 0);
    if (zeroQuantityEquipments.length > 0) {
      issues.push(`${zeroQuantityEquipments.length} equipment(s) with zero or negative quantity`);
    }

    // Check for equipments without name
    const unnamedEquipments = equipments.filter(eq => !eq.name || eq.name.trim() === '');
    if (unnamedEquipments.length > 0) {
      issues.push(`${unnamedEquipments.length} equipment(s) without name`);
    }

    if (issues.length > 0) {
      console.warn(`[EquipmentsMerger] Validation issues found in ${context}:`, issues);
    }

    console.debug(`[EquipmentsMerger] Validation summary for ${context}:`, {
      total: equipments.length,
      roomEquipments: roomEquipments.length,
      optionEquipments: optionEquipments.length,
      issues: issues.length
    });
  }, []);

  /**
   * Merge room equipments with existing backend equipments
   * Preserves option equipments from backend and deduplicates the result
   */
  const mergeRoomEquipments = useCallback((
    roomEquipments: Equipment[],
    existingBackendEquipments: ProjectEquipmentDto[]
  ): ProjectEquipmentDto[] => {
    const existingOptionEquipments = existingBackendEquipments?.filter(eq => eq.category === 'option') || [];
    const roomEquipmentsBackend = equipmentsToBackend(roomEquipments);
    
    // Validate inputs
    validateEquipments(roomEquipmentsBackend, 'room equipments');
    validateEquipments(existingOptionEquipments, 'existing option equipments');
    
    // Combine all equipments and deduplicate
    const allEquipments = [...roomEquipmentsBackend, ...existingOptionEquipments];
    const result = deduplicateEquipments(allEquipments);
    
    validateEquipments(result, 'merged room equipments result');
    return result;
  }, [deduplicateEquipments, validateEquipments]);

  /**
   * Merge option equipments with existing backend equipments  
   * Preserves room equipments from backend and deduplicates the result
   */
  const mergeOptionEquipments = useCallback((
    options: ProjectOptions,
    projectId: string,
    existingBackendEquipments: ProjectEquipmentDto[]
  ): ProjectEquipmentDto[] => {
    const existingRoomEquipments = existingBackendEquipments?.filter(eq => eq.category === 'equipment') || [];
    const optionEquipmentsBackend = optionsToEquipments(options, projectId);
    
    // Validate inputs
    validateEquipments(existingRoomEquipments, 'existing room equipments');
    validateEquipments(optionEquipmentsBackend, 'option equipments');
    
    // Combine all equipments and deduplicate
    const allEquipments = [...existingRoomEquipments, ...optionEquipmentsBackend];
    const result = deduplicateEquipments(allEquipments);
    
    validateEquipments(result, 'merged option equipments result');
    return result;
  }, [deduplicateEquipments, validateEquipments]);

  return {
    mergeRoomEquipments,
    mergeOptionEquipments,
    deduplicateEquipments,
    validateEquipments
  };
}; 
import type { RoomEquipmentValidationResponseDtoContract } from '@/api/generated/data-contracts';
import type { Equipment } from '@/features/abplan/types';

/**
 * Vérifie s'il existe des suggestions d'équipements à appliquer suite à l'appel au moteur de conformité.
 */
export function hasComplianceSuggestions(
  complianceResult: RoomEquipmentValidationResponseDtoContract | null,
): boolean {
  if (!complianceResult?.room_results) return false;
  return complianceResult.room_results.some(
    (room) => room.compliance_status !== 'compliant' && room.missing_equipment?.length! > 0,
  );
}

interface ApplyResult {
  updatedEquipments: Equipment[];
  hasAddedEquipments: boolean;
}

/**
 * Applique les suggestions d'équipements retournées par le moteur de conformité NF C 15-100.
 *
 * @param complianceResult Résultat de conformité contenant les équipements manquants par pièce.
 * @param currentEquipments Liste courante des équipements (sera clonée et jamais mutée).
 * @returns Un objet contenant la nouvelle liste d'équipements et un booléen indiquant si des ajouts/maj ont été effectués.
 */
export function applyComplianceSuggestions(
  complianceResult: RoomEquipmentValidationResponseDtoContract | null,
  currentEquipments: Equipment[],
): ApplyResult {
  if (!complianceResult?.room_results) {
    return { updatedEquipments: currentEquipments, hasAddedEquipments: false };
  }

  const newEquipments: Equipment[] = [...currentEquipments];
  let hasAdded = false;

  // Dictionnaire de correspondance entre les types du moteur de conformité et ceux de l'app.
  const equipmentMapping: Record<string, { name: string; type: string }> = {
    // Prises électriques
    socket: { name: 'Prise simple', type: 'SimpleSocket' },
    sockets: { name: 'Prise simple', type: 'SimpleSocket' },
    simple_socket: { name: 'Prise simple', type: 'SimpleSocket' },
    prise_simple: { name: 'Prise simple', type: 'SimpleSocket' },
    prise: { name: 'Prise simple', type: 'SimpleSocket' },
    outlet: { name: 'Prise simple', type: 'SimpleSocket' },
    '32a socket': { name: 'Prise plaque', type: 'OvenSocket' },
    '32a sockets': { name: 'Prise plaque', type: 'OvenSocket' },

    // Prises réseau
    network_socket: { name: 'Prise RJ45', type: 'NetworkSocket' },
    'network sockets': { name: 'Prise RJ45', type: 'NetworkSocket' },
    rj45: { name: 'Prise RJ45', type: 'NetworkSocket' },
    prise_rj45: { name: 'Prise RJ45', type: 'NetworkSocket' },
    prise_reseau: { name: 'Prise RJ45', type: 'NetworkSocket' },
    ethernet: { name: 'Prise RJ45', type: 'NetworkSocket' },

    // Éclairage
    lighting_point: { name: 'Point lumineux', type: 'LightingPoint' },
    'lighting points': { name: 'Point lumineux', type: 'LightingPoint' },
    point_lumineux: { name: 'Point lumineux', type: 'LightingPoint' },
    light: { name: 'Point lumineux', type: 'LightingPoint' },
    eclairage: { name: 'Point lumineux', type: 'LightingPoint' },
    luminaire: { name: 'Point lumineux', type: 'LightingPoint' },

    // Interrupteurs
    switch: { name: 'Interrupteur simple', type: 'SimpleSwitch' },
    switches: { name: 'Interrupteur simple', type: 'SimpleSwitch' },
    simple_switch: { name: 'Interrupteur simple', type: 'SimpleSwitch' },
    interrupteur: { name: 'Interrupteur simple', type: 'SimpleSwitch' },
    interrupteur_simple: { name: 'Interrupteur simple', type: 'SimpleSwitch' },
    commande: { name: 'Interrupteur simple', type: 'SimpleSwitch' },
  };

  const normalise = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  complianceResult.room_results.forEach((room) => {
    if (room.compliance_status === 'compliant' || !room.missing_equipment?.length) return;

    room.missing_equipment.forEach((rawMissing) => {
      // Exemple : "2 socket(s)"
      const quantityMatch = rawMissing.match(/^(\d+)\s+(.+?)(?:\(s\))?$/);
      let quantity = 1;
      let equipmentLabel = rawMissing;
      if (quantityMatch) {
        quantity = parseInt(quantityMatch[1], 10);
        equipmentLabel = quantityMatch[2].trim();
      }

      const pickMapping = (): { name: string; type: string } | undefined => {
        const normalized = normalise(equipmentLabel);
        return (
          equipmentMapping[normalized] ||
          equipmentMapping[equipmentLabel.toLowerCase()] ||
          // Heuristiques de correspondance partielle
          (normalized.includes('network') || normalized.includes('rj45')
            ? { name: 'Prise RJ45', type: 'NetworkSocket' }
            : normalized.includes('switch') || normalized.includes('interrupteur')
            ? { name: 'Interrupteur simple', type: 'SimpleSwitch' }
            : normalized.includes('lighting') || normalized.includes('light') || normalized.includes('luminaire')
            ? { name: 'Point lumineux', type: 'LightingPoint' }
            : normalized.includes('socket') || normalized.includes('prise')
            ? { name: 'Prise simple', type: 'SimpleSocket' }
            : undefined)
        );
      };

      const mapping = pickMapping();
      if (!mapping) return;

      // Cherche un équipement existant de même type dans la pièce
      const existing = newEquipments.find(
        (eq) => eq.roomId === room.room_id && eq.type === mapping.type,
      );

      if (existing) {
        existing.quantity += quantity;
        hasAdded = true;
      } else {
        newEquipments.push({
          id: `suggestion_${Date.now()}_${Math.random()}`,
          name: mapping.name,
          quantity,
          roomId: room.room_id,
          type: mapping.type,
        });
        hasAdded = true;
      }
    });
  });

  return { updatedEquipments: newEquipments, hasAddedEquipments: hasAdded };
} 
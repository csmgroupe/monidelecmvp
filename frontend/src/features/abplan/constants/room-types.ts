export interface RoomType {
  type: string; // Type en anglais pour l'API
  label: string; // Label en français pour l'interface
  category: 'living' | 'sleeping' | 'service' | 'outdoor' | 'other' | 'circulation';
}

export const ROOM_TYPES: RoomType[] = [
  // Espaces de vie
  { type: 'Kitchen', label: 'Cuisine', category: 'living' },
  { type: 'LivingRoom', label: 'Salon/Séjour', category: 'living' },
  { type: 'LivingRoomWithIntegratedKitchen', label: 'Salon/Séjour avec cuisine intégré', category: 'living' },
  
  // Espaces de circulation
  { type: 'CirculationArea', label: 'Circulation et locaux ≥ 4 m²', category: 'circulation' },
  
  // Espaces de service
  { type: 'WetRoom', label: 'Salle d\'eau', category: 'service' },
  { type: 'WC', label: 'WC', category: 'service' },
  { type: 'BathroomWithWC', label: 'Salle d\'eau avec WC', category: 'service' },
  
  // Espaces de repos et travail
  { type: 'Bedroom', label: 'Chambre/Bureau', category: 'sleeping' },
  
  // Autres espaces
  { type: 'Other', label: 'Autres (garage, dégagement < 4 m2, placard…)', category: 'other' },
  
  // Espaces extérieurs
  { type: 'ExteriorSpace', label: 'Extérieur (terrasse, patio…)', category: 'outdoor' },
];

export const ROOM_TYPE_CATEGORIES = {
  living: 'Espaces de vie',
  circulation: 'Espaces de circulation',
  service: 'Espaces de service',
  sleeping: 'Espaces de repos et travail',
  other: 'Autres espaces',
  outdoor: 'Espaces extérieurs',
};

export function getRoomTypeByType(type: string): RoomType | undefined {
  return ROOM_TYPES.find(roomType => roomType.type === type);
}

export function getRoomTypesByCategory(category: string): RoomType[] {
  return ROOM_TYPES.filter(roomType => roomType.category === category);
} 
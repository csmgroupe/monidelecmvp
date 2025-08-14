export interface ReferenceOption {
  value: string;
  label: string;
  description?: string;
  price?: number;
  quantity?: number;
  enclosureBox?: string;
  enclosureBoxPrice?: number;
}

// Références pour équipements électriques
export const EQUIPMENT_REFERENCES: Record<string, ReferenceOption[]> = {
  'SimpleSocket': [
    { 
      value: 'SCHS520059', 
      label: 'SCHS520059 - Prise simple - 16A - 2P+T Odace', 
      description: 'Prise simple 16A 2P+T', 
      price: 3.24, 
      quantity: 1,
      enclosureBox: 'EUR52061',
      enclosureBoxPrice: 0.3
    },
  ],
  'DoubleSocket': [
    { 
      value: 'SCHS520059', 
      label: 'SCHS520059 - Prise double - 16A - 2P+T Odace', 
      description: 'Prise double 16A 2P+T (2 postes)', 
      price: 6.48, 
      quantity: 2,
      enclosureBox: 'EUR52064',
      enclosureBoxPrice: 3.1
    },
  ],

  'NetworkSocket': [
    { 
      value: 'SCHS520476', 
      label: 'SCHS520476 - Prise RJ45 - cat.6 STP grade 2TV min Odace', 
      description: 'Prise réseau RJ45 Cat6', 
      price: 9.90, 
      quantity: 1,
      enclosureBox: 'EUR52061',
      enclosureBoxPrice: 0.3
    },
  ],
  'TVSocket': [
    { 
      value: 'SCHS520445', 
      label: 'SCHS520445 - Prise TV simple - Odace', 
      description: 'Prise antenne TV', 
      price: 7.00, 
      quantity: 1,
      enclosureBox: 'EUR52061',
      enclosureBoxPrice: 0.3
    },
  ],
  'SimpleSwitch': [
    { 
      value: 'SCHS520204', 
      label: 'SCHS520204 - Interrupteur simple - 10A Odace', 
      description: 'Interrupteur simple', 
      price: 3.50, 
      quantity: 1,
      enclosureBox: 'EUR52061',
      enclosureBoxPrice: 0.3
    },
  ],
  'DoubleSwitch': [
    { 
      value: 'SCHS520214', 
      label: 'SCHS520214 - Interrupteur double - 10A Odace', 
      description: 'Interrupteur double (2 postes)', 
      price: 8.00, 
      quantity: 2,
      enclosureBox: 'EUR52064',
      enclosureBoxPrice: 3.1
    },
  ],
  'OvenSocket': [
    { 
      value: 'SCHS520059', 
      label: 'SCHS520059 - Prise Four/Plaque  - 16A - 2P+T Odace', 
      description: 'Prise Four/Plaque', 
      price: 3.24, 
      quantity: 1,
      enclosureBox: 'EUR52061',
      enclosureBoxPrice: 0.3
    },
  ],
  'ExtractorSocket': [
    { 
      value: 'SCHS520059', 
      label: 'SCHS520059 - Prise Hotte - 16A - 2P+T', 
      description: 'Prise Hotte 16A 2P+T', 
      price: 3.24, 
      quantity: 1,
      enclosureBox: 'EUR52061',
      enclosureBoxPrice: 0.3
    },
  ],
  'DimmerSwitch': [
    { 
      value: 'SCHS520204', 
      label: 'SCHS520204 - Va-et-vient - 10A Odace', 
      description: 'Interrupteur va-et-vient', 
      price: 3.50, 
      quantity: 1,
      enclosureBox: 'EUR52061',
      enclosureBoxPrice: 0.3
    },
  ],
  // 'LightingPoint': [
  //   { 
  //     value: 'SCHS520204', 
  //     label: 'SCHS520204 - Point lumineux', 
  //     description: 'Sortie de câble éclairage', 
  //     price: 3.50, 
  //     quantity: 1,
  //     enclosureBox: 'EUR52061',
  //     enclosureBoxPrice: 0.3
  //   },
  // ]
};

// Références pour plaques de finition blanches
export const WHITE_PLATE_REFERENCES: Record<string, ReferenceOption[]> = {
  'simple': [
    { value: 'SCHS520702', label: 'SCHS520702 - Plaque simple blanche', description: 'Plaque 1 poste blanc', price: 2.00 }
  ],
  'double': [
    { value: 'SCHS520704', label: 'SCHS520704 - Plaque double blanche', description: 'Plaque 2 postes blanc', price: 4.00 }
  ]
};

// Références pour plaques de finition noires
export const BLACK_PLATE_REFERENCES: Record<string, ReferenceOption[]> = {
  'simple': [
    { value: 'SCHS540702', label: 'SCHS540702 - Plaque simple noire', description: 'Plaque 1 poste noir', price: 2.00 }
  ],
  'double': [
    { value: 'SCHS540704', label: 'SCHS540704 - Plaque double noire', description: 'Plaque 2 postes noir', price: 4.00 }
  ]
};

// Références pour boîtes d'encastrement
export const ENCLOSURE_BOX_REFERENCES: ReferenceOption[] = [
  { value: 'EUR52061', label: 'EUR52061 - Boîte simple 40mm', description: 'Boîte d\'encastrement 1 poste 40mm', price: 0.3 },
  { value: 'EUR52064', label: 'EUR52064 - Boîte double 40mm', description: 'Boîte d\'encastrement 2 postes 40mm', price: 3.1 },
  { value: 'EUR52068', label: 'EUR52068 - Boîte simple 50mm', description: 'Boîte d\'encastrement 1 poste 50mm', price: 1.10 },
  { value: 'EUR52071', label: 'EUR52071 - Boîte double 50mm', description: 'Boîte d\'encastrement 2 postes 50mm', price: 1.45 }
];

// Références pour disjoncteurs
export const CIRCUIT_BREAKER_REFERENCES: Record<string, ReferenceOption[]> = {
  '2A': [
    { value: 'SCHR9PFC602', label: 'SCHR9PFC602 - Disjoncteur Resi9 peignable 2A - Courbe C 1P+N', description: 'Disjoncteur Resi9 peignable 2A', price: 10.50 }
  ],
  '6A': [
    { value: 'SCHR9PFC606', label: 'SCHR9PFC606 - Disjoncteur Resi9 peignable 6A - Courbe C 1P+N', description: 'Disjoncteur Resi9 peignable 6A', price: 20.00 }
  ],
  '10A': [
    { value: 'SCHR9PFC610', label: 'SCHR9PFC610 - Disjoncteur Resi9 peignable 10A - Courbe C 1P+N', description: 'Disjoncteur Resi9 peignable 10A', price: 8.50 }
  ],
  '16A': [
    { value: 'SCHR9PFC616', label: 'SCHR9PFC616 - Disjoncteur Resi9 peignable 16A - Courbe C 1P+N', description: 'Disjoncteur Resi9 peignable 16A', price: 8.50 }
  ],
  '20A': [
    { value: 'SCHR9PFC620', label: 'SCHR9PFC620 - Disjoncteur Resi9 peignable 20A - Courbe C 1P+N', description: 'Disjoncteur Resi9 peignable 20A', price: 8.50 }
  ],
  '25A': [
    { value: 'SCHR9PFC625', label: 'SCHR9PFC625 - Disjoncteur Resi9 peignable 25A - Courbe C 1P+N', description: 'Disjoncteur Resi9 peignable 25A', price: 14.00 }
  ],
  '32A': [
    { value: 'SCHR9PFC632', label: 'SCHR9PFC632 - Disjoncteur Resi9 peignable 32A - Courbe C 1P+N', description: 'Disjoncteur Resi9 peignable 32A', price: 14.00 }
  ],
  '40A_2P': [
    { value: 'SCHA9F77240', label: 'SCHA9F77240 - Disjoncteur Acti9 2P 40A - Courbe C - iC60N', description: 'Disjoncteur Acti9 2P 40A', price: 30.00 }
  ],
  '63A_2P': [
    { value: 'SCHA9F77263', label: 'SCHA9F77263 - Disjoncteur Acti9 2P 63A - Courbe C - iC60N', description: 'Disjoncteur Acti9 2P 63A', price: 110.00 }
  ]
};

// Références pour tableaux électriques
export const ELECTRICAL_PANEL_REFERENCES: Record<string, ReferenceOption[]> = {
  '13_modules_studio': [
    { value: 'SCHR9H13401', label: 'SCHR9H13401 - Coffret 13 modules (Studio) - En saillie blanc (RAL 9003)', description: 'Coffret 13 modules (Studio)', price: 25.00 }
  ],
  '18_modules_1_rangee': [
    { value: 'SCHR9H18401', label: 'SCHR9H18401 - Coffret 1 rangée 18 modules - En saillie blanc (RAL 9003)', description: 'Coffret 1 rangée 18 modules', price: 35.00 }
  ],
  '13_modules_2_rangees': [
    { value: 'SCHR9H13402', label: 'SCHR9H13402 - Coffret 2 rangées 13 modules - En saillie blanc (RAL 9003)', description: 'Coffret 2 rangées 13 modules', price: 35.00 }
  ],
  '13_modules_3_rangees': [
    { value: 'SCHR9H13403', label: 'SCHR9H13403 - Coffret 3 rangées 13 modules - En saillie blanc (RAL 9003)', description: 'Coffret 3 rangées 13 modules', price: 50.00 }
  ],
  '13_modules_4_rangees': [
    { value: 'SCHR9H13404', label: 'SCHR9H13404 - Coffret 4 rangées 13 modules - En saillie blanc (RAL 9003)', description: 'Coffret 4 rangées 13 modules', price: 65.00 }
  ],
  '18_modules_2_rangees': [
    { value: 'SCHR9H18402', label: 'SCHR9H18402 - Coffret 2 rangées 18 modules - En saillie blanc (RAL 9003)', description: 'Coffret 2 rangées 18 modules', price: 55.00 }
  ],
  '18_modules_3_rangees': [
    { value: 'SCHR9H18403', label: 'SCHR9H18403 - Coffret 3 rangées 18 modules - En saillie blanc (RAL 9003)', description: 'Coffret 3 rangées 18 modules', price: 65.00 }
  ],
  '18_modules_4_rangees': [
    { value: 'SCHR9H18404', label: 'SCHR9H18404 - Coffret 4 rangées 18 modules - En saillie blanc (RAL 9003)', description: 'Coffret 4 rangées 18 modules', price: 90.00 }
  ]
};

// Références pour câbles
export const CABLE_REFERENCES: Record<string, ReferenceOption[]> = {
  // Câbles R2V
  'r2v_1.5mm': [
    { value: 'ABER2V3G1.5', label: 'ABER2V3G1.5 - Câble R2V 1.5mm²', description: 'Câble R2V 1.5mm²', price: 0.90 }
  ],
  'r2v_2.5mm': [
    { value: 'ABER2V3G2.5', label: 'ABER2V3G2.5 - Câble R2V 2.5mm²', description: 'Câble R2V 2.5mm²', price: 1.20 }
  ],
  'r2v_4mm': [
    { value: 'ABER2V3G4', label: 'ABER2V3G4 - Câble R2V 4mm²', description: 'Câble R2V 4mm²', price: 1.85 }
  ],
  'r2v_6mm': [
    { value: 'ABER2V3G6', label: 'ABER2V3G6 - Câble R2V 6mm²', description: 'Câble R2V 6mm²', price: 2.45 }
  ],
  'r2v_10mm': [
    { value: 'ABER2V3G10', label: 'ABER2V3G10 - Câble R2V 10mm²', description: 'Câble R2V 10mm²', price: 4.20 }
  ],
  // Câbles Prefile
  'prefile_1.5mm': [
    { value: 'ABEPREF3G1.5', label: 'ABEPREF3G1.5 - Câble Prefile 1.5mm²', description: 'Câble Prefile 1.5mm²', price: 0.90 }
  ],
  'prefile_2.5mm': [
    { value: 'ABEPREF3G2.5', label: 'ABEPREF3G2.5 - Câble Prefile 2.5mm²', description: 'Câble Prefile 2.5mm²', price: 1.20 }
  ],
  'prefile_6mm': [
    { value: 'ABEPREF3G6', label: 'ABEPREF3G6 - Câble Prefile 6mm²', description: 'Câble Prefile 6mm²', price: 2.45 }
  ],
  // Câbles spéciaux
  'rj45': [
    { value: 'ABEFTP1X4PCAT6', label: 'ABEFTP1X4PCAT6 - Câble RJ45 Cat6', description: 'Câble RJ45 Cat6 UTP', price: 0.70 }
  ],
  'coaxial': [
    { value: 'ABE17VATC', label: 'ABE17VATC - Câble Coaxial', description: 'Câble Coaxial', price: 0.18 }
  ]
};

// Références pour parafoudres
export const SURGE_PROTECTOR_REFERENCES: ReferenceOption[] = [
  { value: 'SCHR9PLC', label: 'SCHR9PLC - Parafoudre Type 2', description: 'Parafoudre Type 2 - 10kA', price: 120.00 }
];

// Références pour interrupteurs différentiels (DDR)
export const DIFFERENTIAL_CIRCUIT_BREAKER_REFERENCES: Record<string, ReferenceOption[]> = {
  '25A': [
    { value: 'SCHR9PFE225', label: 'SCHR9PFE225 - Interrupteur différentiel 25A - Type A - 30mA', description: 'Interrupteur différentiel 25A - Type A - 30mA', price: 35.00 }
  ],
  '40A': [
    { value: 'SCHR9PFE240', label: 'SCHR9PFE240 - Interrupteur différentiel 40A - Type A - 30mA', description: 'Interrupteur différentiel 40A - Type A - 30mA', price: 45.00 }
  ],
  '63A': [
    { value: 'SCHR9PFE263', label: 'SCHR9PFE263 - Interrupteur différentiel 63A - Type A - 30mA', description: 'Interrupteur différentiel 63A - Type A - 30mA', price: 65.00 }
  ]
};

// Fonction utilitaire pour obtenir les références selon le type
export const getReferencesByType = (type: string, subType?: string): ReferenceOption[] => {
  switch (type) {
    case 'equipment':
      return EQUIPMENT_REFERENCES[subType || ''] || [];
    case 'white_plate':
      return WHITE_PLATE_REFERENCES[subType || 'simple'] || [];
    case 'black_plate':
      return BLACK_PLATE_REFERENCES[subType || 'simple'] || [];
    case 'enclosure_box':
      return ENCLOSURE_BOX_REFERENCES;
    case 'circuit_breaker':
      return CIRCUIT_BREAKER_REFERENCES[subType || '16A'] || [];
    case 'electrical_panel':
      return ELECTRICAL_PANEL_REFERENCES[subType || '18_modules_1_rangee'] || [];
    case 'cable':
      return CABLE_REFERENCES[subType || 'r2v_2.5mm'] || [];
    case 'surge_protector':
      return SURGE_PROTECTOR_REFERENCES;
    case 'differential_circuit_breaker':
      return DIFFERENTIAL_CIRCUIT_BREAKER_REFERENCES[subType || '25A'] || [];
    default:
      return [];
  }
};

// Fonction utilitaire pour obtenir les détails d'une référence
export const getReferenceDetails = (reference: string, type: string, subType?: string): ReferenceOption | null => {
  const references = getReferencesByType(type, subType);
  return references.find(ref => ref.value === reference) || null;
};

// Fonction utilitaire pour obtenir les détails de la boîte d'encastrement selon l'équipement
export const getEnclosureBoxFromEquipment = (equipmentReference: string, equipmentType: string): { reference: string; price: number } | null => {
  const equipmentDetails = getReferenceDetails(equipmentReference, 'equipment', equipmentType);
  if (equipmentDetails?.enclosureBox) {
    return {
      reference: equipmentDetails.enclosureBox,
      price: equipmentDetails.enclosureBoxPrice || 0
    };
  }
  return null;
};

// Fonction utilitaire pour obtenir le prix d'une plaque
export const getPlatePrice = (plateReference: string): number => {
  if (!plateReference || plateReference.trim() === '') return 0;
  
  // Rechercher dans les plaques blanches
  const whitePlateTypes = Object.keys(WHITE_PLATE_REFERENCES);
  for (const type of whitePlateTypes) {
    const plates = WHITE_PLATE_REFERENCES[type];
    const plate = plates.find(p => p.value === plateReference);
    if (plate) return plate.price || 0;
  }
  
  // Rechercher dans les plaques noires
  const blackPlateTypes = Object.keys(BLACK_PLATE_REFERENCES);
  for (const type of blackPlateTypes) {
    const plates = BLACK_PLATE_REFERENCES[type];
    const plate = plates.find(p => p.value === plateReference);
    if (plate) return plate.price || 0;
  }
  
  return 0;
};

// Fonction utilitaire pour obtenir le prix d'une boîte d'encastrement
export const getEnclosureBoxPrice = (enclosureReference: string): number => {
  if (!enclosureReference || enclosureReference.trim() === '') return 0;
  
  const enclosure = ENCLOSURE_BOX_REFERENCES.find(ref => ref.value === enclosureReference);
  return enclosure?.price || 0;
};

// Fonction utilitaire pour obtenir le libellé d'un DDR
export const getDifferentialCircuitBreakerLabel = (reference: string): string => {
  for (const [, breakers] of Object.entries(DIFFERENTIAL_CIRCUIT_BREAKER_REFERENCES)) {
    const breaker = breakers.find(b => b.value === reference);
    if (breaker) {
      return breaker.label;
    }
  }
  return reference;
}; 
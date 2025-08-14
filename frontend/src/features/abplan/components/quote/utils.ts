import type { Room, Equipment } from '../../types';
import type { QuoteItem, DimensioningQuoteItem } from './types';
import { getReferencesByType, getPlatePrice, getEnclosureBoxPrice } from './reference-configs';

export const getEquipmentDisplayName = (equipmentType: string): string => {
  const translations: Record<string, string> = {
    'SimpleSocket': 'Prise simple',
    'DoubleSocket': 'Prise double',
    'WaterproofSocket': 'Prise étanche',
    'NetworkSocket': 'Prise RJ45',
    'TVSocket': 'Prise TV',
    'OvenSocket': 'Prise Plaque',
    'ExtractorSocket': 'Prise Hotte',
    'SimpleSwitch': 'Interrupteur simple',
    'DoubleSwitch': 'Interrupteur double',
    'DimmerSwitch': 'Va-et-vient',
    'LightingPoint': 'Point lumineux',
    'InertiaRadiator': 'Radiateur inertie',
    'Convector': 'Convecteur',
    'WaterHeater': 'Chauffe-eau',
  };
  
  return translations[equipmentType] || equipmentType;
};

export const getRoomName = (roomId: string, rooms: Room[]): string => {
  const room = rooms.find(r => r.id?.toString() === roomId);
  return room?.name || `Pièce ${roomId}`;
};

export const generateQuoteItems = (rooms: Room[], equipments: Equipment[]): QuoteItem[] => {
  // Utiliser un Map pour regrouper les équipements identiques
  const equipmentGroupsMap = new Map<string, QuoteItem>();

  rooms.forEach((room) => {
    const roomEquipments = equipments.filter((eq: Equipment) => eq.roomId === room.id?.toString());
    
    roomEquipments.forEach((equipment: Equipment) => {
      // Filter out LightingPoint equipment types from quote generation
      if (equipment.type === 'LightingPoint') {
        return; // Skip lighting points in the quote
      }

      // Convert Dedicated20ASocket to SimpleSocket
      let equipmentType = equipment.type;
      if (equipmentType === 'Dedicated20ASocket') {
        equipmentType = 'SimpleSocket';
      }

      const availableReferences = getReferencesByType('equipment', equipmentType);
      console.log('availableReferences', availableReferences);
      if (!availableReferences || availableReferences.length === 0) {
        return;
      }

      // Valeurs par défaut basées sur le type d'équipement
      let defaultReference = 'SCHS520059';
      let defaultPrice = 3.24;
      let defaultBoiteEncastrement = 'EUR52061';

      // Personnaliser selon le type d'équipement
      switch (equipmentType) {
        case 'DoubleSocket':
          defaultReference = 'SCHS520059';
          defaultPrice = 3.24;
          defaultBoiteEncastrement = 'EUR52064';
          break;
        case 'SimpleSwitch':
          defaultReference = 'SCHS520204';
          defaultPrice = 3.50;
          break;
        case 'DoubleSwitch':
          defaultReference = 'SCHS520214';
          defaultPrice = 8.00;
          break;
        case 'NetworkSocket':
          defaultReference = 'SCHS520476';
          defaultPrice = 9.90;
          break;
        case 'TVSocket':
          defaultReference = 'SCHS520445';
          defaultPrice = 7.00;
          break;
      }

      const equipmentName = getEquipmentDisplayName(equipmentType || '');
      
      // Déterminer les références de plaques selon la couleur sélectionnée
      const selectedColor = equipment.metadata?.color || '#FFFFFF';
      let plaqueBlanc = '';
      let plaqueNoir = '';
      
      // Vérifier si cet équipement a besoin de plaques (excluding LightingPoint)
      const needsPlates = ['SimpleSocket', 'DoubleSocket', 'SimpleSwitch', 'DoubleSwitch', 'NetworkSocket', 'TVSocket', 'OvenSocket', 'ExtractorSocket'].includes(equipmentType || '');
      
      if (needsPlates) {
        // Définir les références par défaut selon le type d'équipement
        let defaultPlaqueBlanc = 'SCHS520702';
        let defaultPlaqueNoir = 'SCHS540702';
        
        // Références spécifiques pour les prises doubles
        if (equipmentType === 'DoubleSocket') {
          defaultPlaqueBlanc = 'SCHS520704';
          defaultPlaqueNoir = 'SCHS540704';
        }
        
        // Assigner la plaque selon la couleur sélectionnée
        if (selectedColor === '#000000') {
          plaqueBlanc = ''; // Pas de plaque blanche
          plaqueNoir = defaultPlaqueNoir;
        } else {
          // Par défaut (blanc ou autre couleur), utiliser une plaque blanche
          plaqueBlanc = defaultPlaqueBlanc;
          plaqueNoir = ''; // Pas de plaque noire
        }
      }
      
      // Créer une clé unique pour regrouper les équipements identiques
      // La clé inclut: pièce, type, référence, plaque blanche, plaque noire, boîte d'encastrement
      const groupingKey = `${room.id}-${equipmentType}-${defaultReference}-${plaqueBlanc}-${plaqueNoir}-${defaultBoiteEncastrement}`;
      
      if (equipmentGroupsMap.has(groupingKey)) {
        // Équipement identique trouvé, augmenter la quantité
        const existingItem = equipmentGroupsMap.get(groupingKey)!;
        existingItem.quantity += equipment.quantity;
      } else {
        // Nouvel équipement, créer une nouvelle entrée
        equipmentGroupsMap.set(groupingKey, {
          id: `grouped-${groupingKey}`,
          intitule: `${equipmentName}`,
          reference_principal: defaultReference,
          prix: defaultPrice,
          plaque_blanche: plaqueBlanc,
          plaque_noir: plaqueNoir,
          boite_encastrement: defaultBoiteEncastrement,
          section_cable: '', // Géré dans la section dimensionnement
          reference_cable: '', // Géré dans la section dimensionnement
          prix_au: '', // Géré dans la section dimensionnement
          quantity: equipment.quantity,
          roomId: room.id?.toString(),
          equipmentType: equipmentType,
        });
      }
    });
  });

  // Convertir le Map en array
  return Array.from(equipmentGroupsMap.values());
};

export const generateDimensioningItems = (dimensioning: any): DimensioningQuoteItem[] => {
  if (!dimensioning) return [];

  const generatedDimensioningItems: DimensioningQuoteItem[] = [];

  // Disjoncteurs
  if (dimensioning.circuit_breakers) {
    dimensioning.circuit_breakers.forEach((cb: any, index: number) => {
      // Déterminer la référence et le prix selon le calibre
      let reference = 'SCHR9PFC616'; // Défaut 16A
      let price = 8.50;
      
      switch (cb.rating) {
        case 2:
          reference = 'SCHR9PFC602';
          price = 10.50;
          break;
        case 6:
          reference = 'SCHR9PFC606';
          price = 20.00;
          break;
        case 10:
          reference = 'SCHR9PFC610';
          price = 8.50;
          break;
        case 16:
          reference = 'SCHR9PFC616';
          price = 8.50;
          break;
        case 20:
          reference = 'SCHR9PFC620';
          price = 8.50;
          break;
        case 25:
          reference = 'SCHR9PFC625';
          price = 14.00;
          break;
        case 32:
          reference = 'SCHR9PFC632';
          price = 14.00;
          break;
        case 40:
          reference = 'SCHA9F77240';
          price = 30.00;
          break;
        case 63:
          reference = 'SCHA9F77263';
          price = 110.00;
          break;
        default:
          // Pour les autres calibres, utiliser 16A par défaut
          reference = 'SCHR9PFC616';
          price = 8.50;
      }
      
      generatedDimensioningItems.push({
        id: `cb-${index}`,
        type: 'circuit_breaker',
        intitule: translateDescription(cb.description || `Disjoncteur ${cb.rating}A`),
        reference_principal: reference,
        prix: price,
        quantity: cb.quantity,
        rating: cb.rating,
      });
    });
  }

  // Tableaux électriques
  if (dimensioning.electrical_panels) {
    dimensioning.electrical_panels.forEach((panel: any, index: number) => {
      const modules = panel.modules || 18;

      // Tableau des coffrets disponibles (capacité totale, référence, prix)
      const panelOptions = [
        { capacity: 13, reference: 'SCHR9H13401', price: 25.00 },
        { capacity: 18, reference: 'SCHR9H18401', price: 35.00 },
        { capacity: 26, reference: 'SCHR9H13402', price: 35.00 },
        { capacity: 36, reference: 'SCHR9H18402', price: 55.00 },
        { capacity: 39, reference: 'SCHR9H13403', price: 50.00 },
        { capacity: 52, reference: 'SCHR9H13404', price: 65.00 },
        { capacity: 54, reference: 'SCHR9H18403', price: 65.00 },
        { capacity: 72, reference: 'SCHR9H18404', price: 90.00 },
      ];

      // Trouver le coffret avec la plus petite capacité >= modules demandés
      const selectedPanel = panelOptions.find(opt => opt.capacity >= modules) || panelOptions[panelOptions.length - 1];

      generatedDimensioningItems.push({
        id: `panel-${index}`,
        type: 'electrical_panel',
        intitule: panel.type || `Tableau ${selectedPanel.capacity} modules`,
        reference_principal: selectedPanel.reference,
        prix: selectedPanel.price,
        quantity: 1,
        modules: selectedPanel.capacity,
      });
    });
  }

  // Câbles
  if (dimensioning.cables) {
    dimensioning.cables.forEach((cable: any, index: number) => {
      let pricePerMeter = 0.90; // Prix par défaut
      let reference = 'ABER2V3G1.5'; // Référence par défaut
      let intitule = 'Câble'; // Intitulé par défaut
      
      const cableType = cable.cableType || (cable.type?.includes('RJ45') ? 'RJ45' : 
                       cable.type?.includes('Coaxial') ? 'Coaxial' : 'R2V');
      
      // Déterminer la référence et le prix selon le type de câble et la section
      switch (cableType) {
        case 'RJ45':
          pricePerMeter = 0.70;
          reference = 'ABEFTP1X4PCAT6';
          intitule = 'Câble RJ45 Cat6';
          break;
        case 'Coaxial':
          pricePerMeter = 0.18;
          reference = 'ABE17VATC';
          intitule = 'Câble Coaxial';
          break;
        case 'Prefile':
          intitule = `Câble Prefile ${cable.section}mm²`;
          if (cable.section >= 6) {
            pricePerMeter = 2.45;
            reference = 'ABEPREF3G6';
          } else if (cable.section >= 2.5) {
            pricePerMeter = 1.20;
            reference = 'ABEPREF3G2.5';
          } else {
            pricePerMeter = 0.90;
            reference = 'ABEPREF3G1.5';
          }
          break;
        case 'R2V':
        default:
          intitule = `Câble R2V ${cable.section}mm²`;
          if (cable.section >= 10) {
            pricePerMeter = 4.20;
            reference = 'ABER2V3G10';
          } else if (cable.section >= 6) {
            pricePerMeter = 2.45;
            reference = 'ABER2V3G6';
          } else if (cable.section >= 4) {
            pricePerMeter = 1.85;
            reference = 'ABER2V3G4';
          } else if (cable.section >= 2.5) {
            pricePerMeter = 1.20;
            reference = 'ABER2V3G2.5';
          } else {
            pricePerMeter = 0.90;
            reference = 'ABER2V3G1.5';
          }
          break;
      }

      generatedDimensioningItems.push({
        id: `cable-${index}`,
        type: 'cable',
        intitule: intitule,
        reference_principal: reference,
        prix: pricePerMeter,
        quantity: Math.ceil(cable.length_estimate || 10),
        section: cable.section,
        length_estimate: cable.length_estimate,
      });
    });
  }

  // Parafoudres
  if (dimensioning.surge_protectors) {
    dimensioning.surge_protectors.forEach((sp: any, index: number) => {
      generatedDimensioningItems.push({
        id: `sp-${index}`,
        type: 'surge_protector',
        intitule: sp.type || 'Parafoudre Type 2',
        reference_principal: 'SCHR9PLC', // Référence par défaut
        prix: 120.00,
        quantity: sp.quantity,
        rating: sp.rating,
        description: sp.description,
      });
    });
  }

  // Générer automatiquement les DDR basés sur les disjoncteurs
  const circuitBreakers = generatedDimensioningItems.filter(item => item.type === 'circuit_breaker');
  if (circuitBreakers.length > 0) {
    const ddrItems = generateDDRItems(circuitBreakers);
    generatedDimensioningItems.push(...ddrItems);
  }

  return generatedDimensioningItems;
};

export const createNewQuoteItem = (equipmentType?: string): QuoteItem => {
  // Valeurs par défaut
  let defaultValues = {
    intitule: 'Nouvel équipement',
    reference_principal: '',
    prix: 0.00,
    plaque_blanche: 'SCHS520702', // Plaque simple blanche par défaut
    plaque_noir: '',
    boite_encastrement: '',
    equipmentType: equipmentType || ''
  };

  // Si un type d'équipement est spécifié, utiliser les valeurs appropriées
  if (equipmentType) {
    const equipmentReferences = getReferencesByType('equipment', equipmentType);
    if (equipmentReferences.length > 0) {
      const firstRef = equipmentReferences[0];
      
      // Définir la plaque blanche selon le type d'équipement
      const isDoubleEquipment = ['DoubleSocket', 'DoubleSwitch'].includes(equipmentType);
      const defaultWhitePlate = isDoubleEquipment ? 'SCHS520704' : 'SCHS520702';
      
      defaultValues = {
        intitule: getEquipmentDisplayName(equipmentType),
        reference_principal: firstRef.label, // Utilise le label complet
        prix: firstRef.price || 0.00,
        plaque_blanche: defaultWhitePlate,
        plaque_noir: '',
        boite_encastrement: firstRef.enclosureBox || '',
        equipmentType: equipmentType
      };
    }
  }

  return {
    id: `custom-${Date.now()}`,
    intitule: defaultValues.intitule,
    reference_principal: defaultValues.reference_principal,
    prix: defaultValues.prix,
    plaque_blanche: defaultValues.plaque_blanche || 'SCHS520702', // S'assurer qu'il y a toujours une plaque blanche par défaut
    plaque_noir: defaultValues.plaque_noir,
    boite_encastrement: defaultValues.boite_encastrement,
    section_cable: '1.5',
    reference_cable: 'ABER2V3G1.5',
    prix_au: '1.20 €',
    quantity: 1,
    equipmentType: defaultValues.equipmentType,
  };
};

export const calculateTotal = (quoteItems: QuoteItem[], dimensioningItems: DimensioningQuoteItem[]): number => {
  const equipmentTotal = quoteItems.reduce((total, item) => {
    const equipmentPrice = item.prix || 0;
    const whitePlatePrice = getPlatePrice(item.plaque_blanche);
    const blackPlatePrice = getPlatePrice(item.plaque_noir);
    const enclosurePrice = getEnclosureBoxPrice(item.boite_encastrement);
    
    return total + ((equipmentPrice + whitePlatePrice + blackPlatePrice + enclosurePrice) * item.quantity);
  }, 0);
  
  const dimensioningTotal = dimensioningItems.reduce((total, item) => total + (item.prix * item.quantity), 0);
  return equipmentTotal + dimensioningTotal;
};

export const generatePlateItems = (rooms: Room[], equipments: Equipment[]): QuoteItem[] => {
  const plateItems: QuoteItem[] = [];
  const colorCounts: Record<string, Record<string, number>> = {}; // roomId -> color -> count

  // Compter les équipements par couleur et par pièce
  rooms.forEach((room) => {
    const roomId = room.id?.toString();
    if (!roomId) return;

    colorCounts[roomId] = { '#FFFFFF': 0, '#000000': 0 };

    const roomEquipments = equipments.filter((eq: Equipment) => eq.roomId === roomId);
    
    roomEquipments.forEach((equipment: Equipment) => {
      // Utiliser #FFFFFF comme fallback si metadata.color n'est pas défini
      const selectedColor = equipment.metadata?.color || '#FFFFFF';
      
              // Compter seulement les équipements qui ont des plaques (prises et interrupteurs)
        // Exclure les points lumineux du calcul des plaques
        const hasPlates = ['SimpleSocket', 'DoubleSocket', 'SimpleSwitch', 'DoubleSwitch', 'NetworkSocket', 'TVSocket', 'OvenSocket', 'ExtractorSocket'].includes(equipment.type || '');
        
        if (hasPlates && (selectedColor === '#FFFFFF' || selectedColor === '#000000')) {
          colorCounts[roomId][selectedColor] += equipment.quantity;
        }
    });

    // Générer les éléments de plaques pour cette pièce
    Object.entries(colorCounts[roomId]).forEach(([color, count]) => {
      if (count > 0) {
        const colorName = color === '#FFFFFF' ? 'blanche' : 'noire';
        
        // Déterminer la référence appropriée selon la couleur
        // Pour les prises doubles, utiliser les références spécifiques
        let plateReference = '';
        if (color === '#FFFFFF') {
          plateReference = 'SCHS520702'; // Plaque blanche standard
        } else {
          plateReference = 'SCHS540702'; // Plaque noire standard
        }
        
        plateItems.push({
          id: `plate-${roomId}-${color}`,
          intitule: `Plaque ${colorName}`,
          reference_principal: plateReference,
          prix: 1.50, // Prix unitaire d'une plaque
          plaque_blanche: '',
          plaque_noir: '',
          boite_encastrement: '',
          section_cable: '',
          reference_cable: '',
          prix_au: '',
          quantity: count,
          roomId: roomId,
          equipmentType: 'Plate',
          category: 'equipment'
        });
      }
    });
  });

  return plateItems;
};

export const groupItemsByRoom = (quoteItems: QuoteItem[]) => {
  const grouped: { [roomId: string]: QuoteItem[] } = {};
  const customItems: QuoteItem[] = [];
  
  quoteItems.forEach(item => {
    if (item.roomId) {
      if (!grouped[item.roomId]) {
        grouped[item.roomId] = [];
      }
      grouped[item.roomId].push(item);
    } else {
      customItems.push(item);
    }
  });
  
  return { grouped, customItems };
};

export const exportToCSV = (quoteItems: QuoteItem[], dimensioningItems: DimensioningQuoteItem[], rooms: Room[]) => {
  const csvRows: string[] = [];
  
  // En-tête CSV
  csvRows.push('Référence,Quantité');
  
  quoteItems.forEach(item => {
    if (item.reference_principal && item.quantity > 0) {
      csvRows.push(`"${item.reference_principal}",${item.quantity}`);
    }
    
    // Ajouter les plaques si elles existent
    if (item.plaque_blanche && item.plaque_blanche.trim() !== '') {
      csvRows.push(`"${item.plaque_blanche}",${item.quantity}`);
    }
    if (item.plaque_noir && item.plaque_noir.trim() !== '') {
      csvRows.push(`"${item.plaque_noir}",${item.quantity}`);
    }
    
    // Ajouter les boîtes d'encastrement si elles existent
    if (item.boite_encastrement && item.boite_encastrement.trim() !== '') {
      csvRows.push(`"${item.boite_encastrement}",${item.quantity}`);
    }
  });
  
  // Ajouter les éléments de dimensionnement
  dimensioningItems.forEach(item => {
    if (item.reference_principal && item.quantity > 0) {
      csvRows.push(`"${item.reference_principal}",${item.quantity}`);
    }
  });
  
  // Créer le contenu CSV
  const csvContent = csvRows.join('\n');
  
  // Créer et télécharger le fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `estimations_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/**
 * Translate English equipment/circuit descriptions returned by backend
 * into French wording that should appear in the quote (step 8).
 */
const translateDescription = (src: string): string => {
  if (!src) return src;

  const dictionary: Record<string, string> = {
    // Generic terms
    'Circuit': 'Circuit',
    'circuit breaker': 'disjoncteur',
    'circuit breaker(s)': 'disjoncteur',

    // Socket types
    'SimpleSocket': 'prise simple',
    'DoubleSocket': 'prise double',
    'WaterproofSocket': 'prise étanche',
    'NetworkSocket': 'prise RJ45',
    'TVSocket': 'prise TV',
    'OvenSocket': 'prise four',
    'ExtractorSocket': 'prise hotte',
    'Dedicated20ASocket': 'prise dédiée 20A',

    // Lighting / switches
    'LightingPoint': 'point lumineux',
    'SimpleSwitch': 'interrupteur simple',
    'DoubleSwitch': 'interrupteur double',
    'DimmerSwitch': 'va-et-vient',

    // Heating
    'InertiaRadiator': 'radiateur inertie',
    'Convector': 'convecteur',
    'AirConditioning': 'climatisation',
    'FloorHeating': 'plancher chauffant',
    'DuctedHeatPump': 'pompe à chaleur gainée',

    // Water heater
    'WaterHeater': 'chauffe-eau',
  };

  let res = src;
  Object.entries(dictionary).forEach(([en, fr]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'g');
    res = res.replace(regex, fr);
  });

  return res;
};

export const generateDDRItems = (circuitBreakers: DimensioningQuoteItem[]): DimensioningQuoteItem[] => {
  const ddrItems: DimensioningQuoteItem[] = [];
  const maxModulesPerRow = 8;
  
  const rows: DimensioningQuoteItem[][] = [];
  let currentRow: DimensioningQuoteItem[] = [];
  let currentRowModules = 0;
  
  for (const breaker of circuitBreakers) {
    const breakerModules = (breaker.rating && (breaker.rating === 40 || breaker.rating === 63)) ? 2 : 1;
    
    if (currentRowModules + breakerModules > maxModulesPerRow && currentRow.length > 0) {
      rows.push([...currentRow]);
      currentRow = [];
      currentRowModules = 0;
    }
    
    currentRow.push(breaker);
    currentRowModules += breakerModules;
  }
  
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  rows.forEach((row, rowIndex) => {
    const totalRating = row.reduce((sum, breaker) => sum + (Number(breaker.rating) || 0), 0);
    const adjustedRating = Math.ceil(totalRating * 0.7); 
    
    let ddrRating: number;
    let ddrReference: string;
    let ddrPrice: number;
    
    if (adjustedRating <= 25) {
      ddrRating = 25;
      ddrReference = 'SCHR9PFE225';
      ddrPrice = 35.00;
    } else if (adjustedRating <= 40) {
      ddrRating = 40;
      ddrReference = 'SCHR9PFE240';
      ddrPrice = 45.00;
    } else {
      ddrRating = 63;
      ddrReference = 'SCHR9PFE263';
      ddrPrice = 65.00;
    }
    
    const rowId = `row-${rowIndex + 1}`;
    const circuitBreakerIds = row.map(breaker => breaker.id);
    
    ddrItems.push({
      id: `ddr-${rowIndex + 1}`,
      type: 'differential_circuit_breaker',
      intitule: `DDR ${ddrRating}A - Rangée ${rowIndex + 1}`,
      reference_principal: ddrReference,
      prix: ddrPrice,
      quantity: 1,
      rating: ddrRating,
      rowId: rowId,
      circuitBreakerIds: circuitBreakerIds,
      description: `Interrupteur différentiel ${ddrRating}A pour ${row.length} circuit(s) - Calibre total: ${totalRating}A, Ajusté (0.7): ${adjustedRating}A`
    });
  });
  
  return ddrItems;
};

// Fonction pour mettre à jour les éléments de dimensionnement avec les DDR
export const updateDimensioningItemsWithDDR = (
  dimensioningItems: DimensioningQuoteItem[]
): DimensioningQuoteItem[] => {
  // Supprimer les anciens DDR
  const itemsWithoutDDR = dimensioningItems.filter(item => item.type !== 'differential_circuit_breaker');
  
  // Récupérer les disjoncteurs
  const circuitBreakers = itemsWithoutDDR.filter(item => item.type === 'circuit_breaker');
  
  // Générer les nouveaux DDR
  const ddrItems = generateDDRItems(circuitBreakers);
  
  // Retourner tous les éléments avec les nouveaux DDR
  return [...itemsWithoutDDR, ...ddrItems];
}; 
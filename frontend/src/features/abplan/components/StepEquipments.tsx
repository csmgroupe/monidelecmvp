import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Plus, Minus, Lightbulb, Wifi, Power, Tv, Zap, Fan, Bath, ChevronLeft, ChevronRight, ToggleLeft, AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';
import { PlanViewer } from './shared/PlanViewer';
import type { Project, Equipment, Room } from '../types';
import { useProjectEquipments } from '../../shared/hooks/project-equipments/useProjectEquipments';
import { useDebouncedEquipmentsUpdate } from '../../shared/hooks/project-equipments/useDebouncedEquipmentsUpdate';
import { equipmentsToBackend, equipmentsFromBackend } from '../../shared/utils/equipmentsToBackend';
import { optionsToEquipments } from '../../shared/utils/optionsToEquipments';
import { useComplianceValidation, type ComplianceValidationParams } from '@/features/shared/hooks/compliance/useComplianceValidation';
import { RoomEquipmentValidationResponseDtoContract, RoomResultDtoContract } from '@/api/generated/data-contracts';
import { useEquipmentsMerger } from '../../shared/hooks/project-equipments/useEquipmentsMerger';
import { ComplianceVerificationSection } from './shared/ComplianceVerificationSection';
import { hasComplianceSuggestions, applyComplianceSuggestions } from '@/features/shared/utils/complianceSuggestions';

interface StepEquipmentsProps {
  onNext: () => void;
  onPrevious: () => void;
  projectData: Partial<Project>;
  setProjectData: (data: Partial<Project>) => void;
  initialRoomId?: string;
}

interface EquipmentType {
  id: string;
  name: string;
  tooltip: string;
  icon: React.ElementType;
  colors?: string[];
  quantity?: number;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  equipments: EquipmentType[];
}

const categories: Category[] = [
  {
    id: 'electricite',
    name: 'Électricité',
    icon: Zap,
    equipments: [
      { 
        id: 'SimpleSocket', 
        name: 'Prise simple', 
        icon: Power,
        tooltip: 'Prise 16A - 230V',
        colors: ['#FFFFFF', '#000000']
      },
      { 
        id: 'Dedicated20ASocket', 
        name: 'Prise simple sur circuit dédié 20A', 
        icon: Power,
        tooltip: 'Prise simple sur circuit dédié 20A',
        colors: ['#FFFFFF', '#000000']
      },
      { 
        id: 'DoubleSocket', 
        name: 'Prise double', 
        icon: Power,
        tooltip: 'Double prise 16A - 230V, max 3680W. Recommandé pour les zones de travail et multimédia.',
        colors: ['#FFFFFF', '#000000']
      },
      { 
        id: 'NetworkSocket', 
        name: 'Prise RJ45', 
        icon: Wifi,
        tooltip: 'Prise réseau Cat.6 minimum. Recommandé : 2 prises par pièce principale pour TV/Internet.',
        colors: ['#FFFFFF', '#000000']
      },
      { 
        id: 'TVSocket', 
        name: 'Prise TV', 
        icon: Tv,
        tooltip: 'Prise coaxiale TV/SAT. À coupler avec une prise RJ45 pour les box internet.',
        colors: ['#FFFFFF', '#000000']
      },
      { 
        id: 'OvenSocket', 
        name: 'Prise plaque', 
        icon: Power,
        tooltip: 'Circuit dédié 32A. Obligatoire sur circuit spécialisé.',
        colors: ['#FFFFFF', '#000000']
      },
      { 
        id: 'ExtractorSocket', 
        name: 'Prise hotte', 
        icon: Power,
        tooltip: 'Circuit 16A - 230V. Installation à 1,80m du sol minimum.',
        colors: ['#FFFFFF', '#000000']
      },
    ]
  },
  {
    id: 'eclairage',
    name: 'Éclairage',
    icon: Lightbulb,
    equipments: [
      {
        id: 'LightingPoint',
        name: 'Point lumineux',
        icon: Lightbulb,
        tooltip: 'Point lumineux',
        colors: ['#FFFFFF', '#000000'],
      },
      { 
        id: 'SimpleSwitch', 
        name: 'Interrupteur simple', 
        icon: ToggleLeft, 
        colors: ['#FFFFFF', '#000000'],
        tooltip: 'Interrupteur unipolaire 10A. Installation à 1,10m du sol. Obligatoire à l\'entrée de chaque pièce. Disponible en blanc, gris ou noir.'
      },
      { 
        id: 'DoubleSwitch', 
        name: 'Interrupteur double', 
        icon: ToggleLeft, 
        colors: ['#FFFFFF', '#000000'],
        tooltip: 'Double interrupteur 10A. Idéal pour commander deux circuits d\'éclairage distincts. Disponible en blanc, gris ou noir.'
      },
      { 
        id: 'DimmerSwitch', 
        name: 'Va-et-vient', 
        icon: ToggleLeft, 
        colors: ['#FFFFFF', '#000000'],
        tooltip: 'Permet de commander un même point lumineux depuis deux endroits. Obligatoire dans les couloirs et grandes pièces. Disponible en blanc, gris ou noir.'
      }
    ]
  },
  {
    id: 'chauffage',
    name: 'Chauffage/Climatisation',
    icon: Zap,
    equipments: [
      {
        id: 'InertiaRadiator',
        name: 'Radiateur inertie',
        icon: Zap,
        tooltip: 'Radiateur inertie'
      },
      {
        id: 'Convector',
        name: 'Convecteur',
        icon: Zap,
        tooltip: 'Convecteur'
      },
      {
        id: 'AirConditioning',
        name: 'Climatisation',
        icon: Zap,
        tooltip: 'Climatisation'
      },
      {
        id: 'FloorHeating',
        name: 'Plancher chauffant',
        icon: Zap,
        tooltip: 'Plancher chauffant'
      },
      {
        id: 'DuctedHeatPump',
        name: 'Pompe à chaleur gainée',
        icon: Zap,
        tooltip: 'Pompe à chaleur gainée'
      }
    ]
  },
  {
    id: 'chauffe_eau',
    name: 'Chauffe-Eau',
    icon: Bath,
    equipments: [
      {
        id: 'WaterHeater',
        name: 'Chauffe-eau',
        icon: Bath,
        tooltip: 'Chauffe-eau'
      },
      // {
      //   id: 'thermodynamique',
      //   name: 'Chauffe-eau thermodynamique',
      //   icon: Bath,
      //   tooltip: 'Chauffe-eau thermodynamique'
      // },
      // {
      //   id: 'pac',
      //   name: 'Couplage PAC/Chauffe-eau',
      //   icon: Bath,
      //   tooltip: 'Solution combinée PAC/Chauffe-eau'
      // }
    ]
  },
  {
    id: 'vmc',
    name: 'VMC',
    icon: Fan,
    equipments: [
      {
        id: 'SimpleFlowVMC',
        name: 'Simple flux',
        icon: Fan,
        tooltip: 'Simple flux'
      },
      {
        id: 'DoubleFlowVMC',
        name: 'Double flux',
        icon: Fan,
        tooltip: 'Double flux'
      }
    ]
  }
];

export function StepEquipments({ onNext, onPrevious, projectData, setProjectData, initialRoomId }: StepEquipmentsProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>((initialRoomId ?? projectData.pieces?.[0]?.id?.toString()) || '');
  const [selectedCategory, setSelectedCategory] = useState('electricite');
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [localEquipments, setLocalEquipments] = useState<Equipment[]>([]);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const hasInitialized = useRef(false);
  const hasValidatedInitial = useRef(false);

  // Get all plans for display (same as StepRooms)
  const planFiles = (projectData as any)?.planFiles || [];

  // Backend integration
  const projectId = projectData.id as string;
  const { data: projectEquipmentsData, isLoading } = useProjectEquipments(projectId, { enabled: !!projectId });
  const updateProjectEquipments = useDebouncedEquipmentsUpdate();
  const { mergeRoomEquipments } = useEquipmentsMerger();

  // Extract equipment data from backend response
  const backendEquipments = useMemo(() => {
    if (!projectEquipmentsData?.equipments) return [];
    return equipmentsFromBackend(projectEquipmentsData.equipments);
  }, [projectEquipmentsData]);

  // Initialize local state from backend data (only once)
  useEffect(() => {
    if (backendEquipments.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      
      setLocalEquipments(backendEquipments);
      
      // Initialize selected colors from existing equipment
      const colors: Record<string, string> = {};
      backendEquipments.forEach(equipment => {
        if (equipment.metadata?.color && equipment.type) {
          colors[equipment.type] = equipment.metadata.color;
        }
      });
      setSelectedColors(colors);
      
      // Update parent component with backend data
      setProjectData({
        ...projectData,
        equipments: backendEquipments
      });

      if (!hasValidatedInitial.current) {
        validateCompliance(backendEquipments);
        hasValidatedInitial.current = true;
      }
    }
  }, [backendEquipments]);

  // Auto-select first room when rooms are loaded
  useEffect(() => {
    if (!selectedRoom && projectData.pieces && projectData.pieces.length > 0) {
      setSelectedRoom(projectData.pieces[0].id.toString());
    }
  }, [projectData.pieces, selectedRoom]);

  // Initialize default colors for equipment with color options (all white by default)
  useEffect(() => {
    const defaultColors: Record<string, string> = {};
    categories.forEach(category => {
      category.equipments.forEach(equipment => {
        if (equipment.colors && equipment.colors.length > 0) {
          // Use white as default if no color is already selected
          if (!selectedColors[equipment.id]) {
            defaultColors[equipment.id] = '#FFFFFF';
          }
        }
      });
    });
    
    if (Object.keys(defaultColors).length > 0) {
      setSelectedColors(prev => ({ ...prev, ...defaultColors }));
    }
  }, [selectedColors]); // Only run when selectedColors changes

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isRoomDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.room-dropdown')) {
          setIsRoomDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoomDropdownOpen]);

  // Save to backend with optimistic updates and proper debouncing
  const saveToBackend = useCallback((equipments: Equipment[]) => {
    if (!projectId) return;
    
    // Use the merger to properly combine room equipments with existing backend data
    const allBackendEquipments = mergeRoomEquipments(
      equipments,
      projectEquipmentsData?.equipments || []
    );

    updateProjectEquipments.debouncedMutate({
      data: {
        projectId,
        equipments: allBackendEquipments
      }
    });
  }, [projectId, projectEquipmentsData?.equipments, updateProjectEquipments, mergeRoomEquipments]);

  const navigateRoom = (direction: 'prev' | 'next') => {
    const rooms = projectData.pieces || [];
    const currentIndex = rooms.findIndex((room: Room) => room.id.toString() === selectedRoom);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : rooms.length - 1;
    } else {
      newIndex = currentIndex < rooms.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedRoom(rooms[newIndex].id.toString());
  };

  const selectRoom = (roomId: string) => {
    setSelectedRoom(roomId);
    setIsRoomDropdownOpen(false);
  };

  const getEquipmentsForRoom = (roomId: string): Equipment[] => {
    return localEquipments.filter(eq => eq.roomId === roomId) || [];
  };

  const getFilteredEquipments = (categoryEquipments: EquipmentType[], roomId: string): EquipmentType[] => {
    if (!roomId || !projectData.pieces) return categoryEquipments;
    
    const room = projectData.pieces.find((r: Room) => r.id.toString() === roomId);
    if (!room) return categoryEquipments;

    const roomType = (room as any).options?.roomType || '';
        
    const kitchenTypes = ['Kitchen', 'LivingRoomWithIntegratedKitchen'];
    const kitchenEquipmentIds = ['OvenSocket', 'ExtractorSocket']; 
    
    const isKitchenType = kitchenTypes.includes(roomType);
    
    if (!isKitchenType) {
      return categoryEquipments.filter(equipment => !kitchenEquipmentIds.includes(equipment.id));
    }
    
    return categoryEquipments;
  };

  const handleAddEquipment = (equipment: EquipmentType) => {
    if (!selectedRoom) return;

    // Use selected color or default to first color if equipment has colors
    let selectedColor = selectedColors[equipment.id];
    if (!selectedColor && equipment.colors && equipment.colors.length > 0) {
      selectedColor = equipment.colors[0];
      // Update selectedColors state to reflect the default choice
      setSelectedColors(prev => ({ ...prev, [equipment.id]: selectedColor }));
    }
    
    const newEquipment: Equipment = {
      id: `${Date.now()}_${Math.random()}`,
      name: equipment.name,
      quantity: 1,
      roomId: selectedRoom,
      type: equipment.id,
      metadata: selectedColor ? { color: selectedColor } : undefined,
    };

    const newLocalEquipments = [...localEquipments, newEquipment];
    setLocalEquipments(newLocalEquipments);
    
    // Update parent component
    setProjectData({
      ...projectData,
      equipments: newLocalEquipments,
    });

    // Save to backend
    saveToBackend(newLocalEquipments);
  };

  const handleUpdateQuantity = (equipmentId: string, increment: number) => {
    const newLocalEquipments = localEquipments.map(eq => {
      if (eq.id === equipmentId) {
        const newQuantity = Math.max(0, eq.quantity + increment);
        return newQuantity === 0 ? null : { ...eq, quantity: newQuantity };
      }
      return eq;
    }).filter(Boolean) as Equipment[];

    setLocalEquipments(newLocalEquipments);
    
    // Update parent component
    setProjectData({
      ...projectData,
      equipments: newLocalEquipments,
    });

    // Save to backend
    saveToBackend(newLocalEquipments);
  };

  const handleColorSelection = (equipmentType: string, color: string) => {
    // Update selected colors state for ALL equipment types with the same color
    const updatedColors: Record<string, string> = {};
    categories.forEach(category => {
      category.equipments.forEach(equipment => {
        if (equipment.colors && equipment.colors.length > 0) {
          updatedColors[equipment.id] = color;
        }
      });
    });
    setSelectedColors(prev => ({ ...prev, ...updatedColors }));
    
    // Update ALL existing equipments with the new color (regardless of type)
    const newLocalEquipments = localEquipments.map(eq => {
      return {
        ...eq,
        metadata: {
          ...eq.metadata,
          color: color
        }
      };
    });

    // Only update if there are changes
    if (newLocalEquipments.some((eq, index) => eq !== localEquipments[index])) {
      setLocalEquipments(newLocalEquipments);
      
      // Update parent component
      setProjectData({
        ...projectData,
        equipments: newLocalEquipments,
      });

      // Save to backend immediately
      saveToBackend(newLocalEquipments);
    }
  };

  // Update the selected room if the initialRoomId prop changes (e.g. when opening modal for a given room)
  useEffect(() => {
    if (initialRoomId) {
      setSelectedRoom(initialRoomId);
    }
  }, [initialRoomId]);

  // Compliance validation state
  const complianceValidation = useComplianceValidation();
  const [complianceResult, setComplianceResult] = useState<RoomEquipmentValidationResponseDtoContract | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const lastValidatedSignature = useRef<string | null>(null);
  const [complianceError, setComplianceError] = useState<string | null>(null);

  // New states for global compliance header
  const complianceResultSignature = useRef<string | null>(null);
  const [isApplyingSuggestions, setIsApplyingSuggestions] = useState(false);

  const roomArray = (projectData as any).pieces || (projectData as any).rooms || [];

  // Compute freshness & global status
  const isGloballyCompliant = complianceResult?.global_compliance?.overall_status === 'compliant';

  const currentSignature = JSON.stringify({
    rooms: roomArray.map((r: any) => ({ id: r.id, surface: r.surface, type: r.roomType })),
    equipments: projectData.equipments ?? [],
  });

  const isResultStale = complianceResultSignature.current !== currentSignature;

  const hasComplianceIssues = !!complianceResult && !isGloballyCompliant && !isResultStale;

  const hasSuggestions = useMemo(() => {
    if (!hasComplianceIssues) return false;
    return hasComplianceSuggestions(complianceResult);
  }, [hasComplianceIssues, complianceResult]);

  // Suggestions application
  const applySuggestions = async () => {
    if (!complianceResult?.room_results) return;

    setIsApplyingSuggestions(true);
    try {
      const { updatedEquipments, hasAddedEquipments } = applyComplianceSuggestions(
        complianceResult,
        localEquipments,
      );

      if (hasAddedEquipments) {
        setLocalEquipments(updatedEquipments);
        setProjectData({ ...projectData, equipments: updatedEquipments });
        // Persiste côté backend
        saveToBackend(updatedEquipments);
        // Revérifie la conformité
        validateCompliance(updatedEquipments);
      }
    } finally {
      setIsApplyingSuggestions(false);
    }
  };

  // Build compliance payload (similar to StepSummary)
  const transformToComplianceData = (equipmentsOverride?: Equipment[]): ComplianceValidationParams | null => {
    if (!projectData.id || roomArray.length === 0) return null;

    const mapRoomType = (frontendRoomType: string): string => {
      const roomTypeMapping: Record<string, string> = {
        'Chambre/Bureau': 'Bedroom',
        'Salon/Séjour': 'LivingRoom',
        'Salon/Séjour avec cuisine intégré': 'LivingRoomWithIntegratedKitchen',
        'Cuisine': 'Kitchen',
        'Salle d\'eau': 'WetRoom',
        'WC': 'WC',
        'Salle d\'eau avec WC': 'BathroomWithWC',

        'Circulation et locaux ≥ 4 m²': 'CirculationArea',
        'Autres (garage, dégagement < 4 m2, placard…)': 'Other',
        'Extérieur (terrasse, patio…)': 'ExteriorSpace'
      };

      return roomTypeMapping[frontendRoomType] || frontendRoomType;
    };

    const complianceData = {
      installation_id: projectData.id.toString(),
      '@context': {
        '@vocab': 'http://example.org/nfc15100#',
        'installation': 'Installation',
        'room': 'Room',
        'equipment': 'Equipment'
      },
      postal_code: projectData.codePostal,
      rooms: roomArray.map((room: Room) => {
        const equipmentsSource = equipmentsOverride ?? (projectData.equipments ?? []);
        const equipments = equipmentsSource.filter((eq: Equipment) => eq.roomId === (room.id?.toString() || ''));
        return {
          room_id: room.id?.toString() || '',
          room_type: mapRoomType((room as any).options?.roomType || 'Other'),
          room_area: room.surface,
          equipment: equipments.map((eq: Equipment) => ({
            equipment_type: eq.type || 'SimpleSocket',
            quantity: eq.quantity,
            specifications: (eq as any).options || {}
          }))
        };
      })
    };

    return complianceData;
  };

  const validateCompliance = async (equipmentsOverride?: Equipment[]) => {
    console.log('[validateCompliance] Validating compliance...');
    const complianceData = transformToComplianceData(equipmentsOverride);
    if (!complianceData) return;

    const signature = JSON.stringify({ rooms: roomArray, equipments: equipmentsOverride ?? projectData.equipments });
    if (signature === lastValidatedSignature.current) return; // avoid duplicate call

    lastValidatedSignature.current = signature;
    setIsValidating(true);
    setComplianceError(null);
    try {
      const result = await complianceValidation.mutateAsync(complianceData);
      setComplianceResult(result);
      // Memorise signature pour détecter l'obsolescence des résultats
      complianceResultSignature.current = JSON.stringify({
        rooms: roomArray.map((r: any) => ({ id: r.id, surface: r.surface, type: r.roomType })),
        equipments: projectData.equipments ?? [],
      });
    } catch(err: any) {
      console.error('Compliance validation failed', err);
      
      // Extract detailed error information
      let errorMessage = 'Erreur lors de la validation de conformité';
      
      if (err?.response?.data) {
        const errorData = err.response.data;
        if (errorData.detail) {
          errorMessage = `Erreur de validation: ${errorData.detail}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setComplianceError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const getRoomComplianceStatus = (roomId: string): RoomResultDtoContract | null => {
    if (!complianceResult?.room_results) return null;
    return complianceResult.room_results.find(r => r.room_id === roomId) || null;
  };

  // Helper to translate equipment types (copy subset)
  const translateEquipmentType = (missingEquipmentType: string): string => {
    // Extract quantity and type (e.g. "2 socket(s)")
    const quantityMatch = missingEquipmentType.match(/^([0-9]+)\s+(.+?)(?:\(s\))?$/);
    let quantity = 1;
    let typeStr = missingEquipmentType;

    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1], 10);
      typeStr = quantityMatch[2].trim();
    }

    const translations: Record<string, string> = {
      'socket': 'prise',
      'sockets': 'prises',
      'simple_socket': 'prise',
      'double_socket': 'prise double',
      '32a socket': 'prise 32A plaque',
      '32a sockets': 'prises 32A plaque',
      'network socket': 'prise RJ45',
      'network sockets': 'prises RJ45',
      'lighting point': 'point lumineux',
      'lighting points': 'points lumineux',
      'switch': 'interrupteur',
      'switches': 'interrupteurs'
    };

    const normalized = typeStr.toLowerCase();
    const translated = translations[normalized] || translations[typeStr] || typeStr;

    // plural management
    if (quantity > 1) {
      return `${quantity} ${translated.endsWith('s') ? translated : translated + (translated.endsWith('eau') ? 'x' : 's')}`;
    }
    return `1 ${translated}`;
  };

  // Re-validate when backend update succeeds
  useEffect(() => {
    if (updateProjectEquipments.isSuccess) {
      validateCompliance(localEquipments);
      updateProjectEquipments.reset(); // prevent repeated triggers
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateProjectEquipments.isSuccess]);

  useEffect(() => {
    // Déclenche une première validation si aucun équipement n'est encore chargé
    if (!hasValidatedInitial.current && roomArray.length > 0 && !isValidating) {
      hasValidatedInitial.current = true;
      validateCompliance(localEquipments);
    }
  }, [roomArray.length, isValidating]);

  return (
    <>
      {/* Global compliance verification header */}
      <ComplianceVerificationSection
        complianceResult={complianceResult}
        isValidating={isValidating}
        complianceError={complianceError}
        hasSuggestions={hasSuggestions}
        isApplyingSuggestions={isApplyingSuggestions}
        applySuggestions={applySuggestions}
        validateCompliance={() => validateCompliance()}
        isResultStale={isResultStale}
        rooms={roomArray.map((r: any) => ({ id: r.id?.toString() || '', label: r.name || (r as any).options?.roomType || `Pièce ${r.id}` }))}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left section - Plan image */}
        <div className="lg:w-5/12 w-full">
          <PlanViewer
            planFiles={planFiles}
            title="Plans du projet"
            maxHeight="calc(100vh-300px)"
          />
          <div className="mt-4 space-y-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <p className="text-lg font-medium text-gray-900 flex items-center">
                  Surface totale : {
                    projectData.pieces?.reduce((acc, room) => acc + room.surface, 0).toFixed(2) || '0.00'
                  } m²
                </p>
                <div className="relative group">
                  <div className="cursor-help">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    La surface totale correspond à la somme des surfaces de toutes les pièces que vous avez définies. 
                    Cette valeur se recalcule automatiquement lorsque vous modifiez la surface d'une pièce.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance alert inside left panel */}
            {selectedRoom && !isValidating && (() => {
              const roomStatus = getRoomComplianceStatus(selectedRoom);
              if (!roomStatus || roomStatus.compliance_status === 'compliant') return null;
              return (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 space-y-1">
                      {roomStatus.missing_equipment?.length > 0 && (
                        <p>Équipements manquants : {roomStatus.missing_equipment.map(translateEquipmentType).join(', ')}</p>
                      )}
                      {roomStatus.violations?.map((v, idx) => (
                        <p key={idx}>{v.message}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {isValidating && (
              <div className="flex items-center text-blue-600 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                <span>Vérification de la conformité…</span>
              </div>
            )}

            {complianceError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium text-sm">Erreur de validation NF C 15-100</p>
                    <p className="text-red-700 text-sm mt-1">{complianceError}</p>
                    <button
                      onClick={() => validateCompliance()}
                      className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right section - Equipment tabs */}
        <div className="lg:w-9/12 w-full">
          {/* Room Navigation */}
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateRoom('prev')}
                className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                title="Pièce précédente"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="relative flex-1 min-w-0 mx-4 room-dropdown">
                <button
                  onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
                  className="w-full flex items-center justify-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="text-center flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {projectData.pieces?.find((r: Room) => r.id.toString() === selectedRoom)?.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {projectData.pieces?.find((r: Room) => r.id.toString() === selectedRoom)?.surface} m²
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${isRoomDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isRoomDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {projectData.pieces?.map((room: Room) => (
                      <button
                        key={room.id}
                        onClick={() => selectRoom(room.id.toString())}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                          room.id.toString() === selectedRoom ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{room.name}</div>
                          <div className="text-sm text-gray-500">{room.surface} m²</div>
                        </div>
                        {room.id.toString() === selectedRoom && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => navigateRoom('next')}
                className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                title="Pièce suivante"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex space-x-1 mb-4 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>

          {selectedRoom ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 truncate">
                Équipements pour {projectData.pieces?.find((r: Room) => r.id.toString() === selectedRoom)?.name}
              </h3>
                
                {selectedCategory === 'electricite' || selectedCategory === 'eclairage' || selectedCategory === 'chauffage' || selectedCategory === 'chauffe_eau' || selectedCategory === 'vmc' ? (
                <div className="space-y-4">
                  {getFilteredEquipments(
                    categories.find(c => c.id === selectedCategory)?.equipments || [],
                    selectedRoom
                  ).map((equipment) => {
                      const Icon = equipment.icon;
                      const existingEquipment = getEquipmentsForRoom(selectedRoom)
                        .find(eq => eq.name === equipment.name);
                      
                      return (
                        <div
                          key={equipment.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center min-w-0">
                            <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900 truncate">
                                  {equipment.name}
                                </span>
                                {equipment.colors && (
                                  <div className="ml-4 flex items-center space-x-2">
                                    {equipment.colors.map((color) => (
                                      <button
                                        key={color}
                                        onClick={() => handleColorSelection(equipment.id, color)}
                                        className={`w-6 h-6 rounded-full border-2 ${
                                          selectedColors[equipment.id] === color ? 'border-blue-500' : 'border-gray-200'
                                        }`}
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                )}
                                <div className="relative group ml-2">
                                  <div className="cursor-help">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div className="absolute bottom-full left-0 mb-2 w-64 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    {equipment.tooltip}
                                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Special switch toggle for chauffage, chauffe_eau, and vmc categories */}
                          {(selectedCategory === 'chauffage' || selectedCategory === 'chauffe_eau' || selectedCategory === 'vmc') ? (
                            <div className="flex items-center space-x-3">
                              {existingEquipment?.metadata?.color && (
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300" 
                                  style={{ backgroundColor: existingEquipment.metadata.color }}
                                  title={`Couleur: ${existingEquipment.metadata.color}`}
                                />
                              )}
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Non</span>
                                <button
                                  onClick={() => {
                                    if (existingEquipment) {
                                      // Remove equipment (set to 0/non)
                                      handleUpdateQuantity(existingEquipment.id, -existingEquipment.quantity);
                                    } else {
                                      // Add equipment (set to 1/oui)
                                      handleAddEquipment(equipment);
                                    }
                                  }}
                                  disabled={equipment.colors && !selectedColors[equipment.id] && !existingEquipment}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    existingEquipment 
                                      ? 'bg-blue-600' 
                                      : equipment.colors && !selectedColors[equipment.id]
                                      ? 'bg-gray-300 cursor-not-allowed'
                                      : 'bg-gray-300'
                                  }`}
                                  title={equipment.colors && !selectedColors[equipment.id] && !existingEquipment ? 'Veuillez sélectionner une couleur' : ''}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      existingEquipment ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                                <span className="text-sm text-gray-600">Oui</span>
                              </div>
                            </div>
                          ) : (
                            /* Standard quantity controls for other categories */
                            existingEquipment ? (
                              <div className="flex items-center space-x-3">
                                {existingEquipment.metadata?.color && (
                                  <div 
                                    className="w-4 h-4 rounded-full border border-gray-300" 
                                    style={{ backgroundColor: existingEquipment.metadata.color }}
                                    title={`Couleur: ${existingEquipment.metadata.color}`}
                                  />
                                )}
                                <button
                                  onClick={() => handleUpdateQuantity(existingEquipment.id, -1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <Minus className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="text-sm font-medium w-8 text-center">
                                  {existingEquipment.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(existingEquipment.id, 1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <Plus className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddEquipment(equipment)}
                                disabled={equipment.colors && !selectedColors[equipment.id]}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                                  equipment.colors && !selectedColors[equipment.id]
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                                title={equipment.colors && !selectedColors[equipment.id] ? 'Veuillez sélectionner une couleur' : ''}
                              >
                                <Plus className="w-4 h-4" />
                                <span>Ajouter</span>
                              </button>
                            )
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Cette section sera bientôt disponible
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">Sélectionnez une pièce pour voir les équipements disponibles</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
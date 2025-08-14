import {
  Zap,
  RefreshCw,
  CircuitBoard,
  Shield,
  Info,
  Cable,
  Plus,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Project as WizardProject, Room } from '../types';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';
import {
  GlobalValidationWithDimensioningResponseDtoContract,
} from '@/api/generated/data-contracts';
import {
  useComplianceDimensioning,
  type ComplianceDimensioningParams,
} from '@/features/shared/hooks/compliance/useComplianceDimensioning';
import { useUpdateProject } from '@/features/shared/hooks/projects/useUpdateProject';
import { ConfirmRecalculateDimensioningModal } from './ConfirmRecalculateDimensioningModal';
import React from 'react';

// Types for editable data
interface EditableCircuitBreaker {
  id: string;
  description: string;
  rating: number;
  quantity: number;
}

interface EditableElectricalPanel {
  id: string;
  type: string;
  modules: number;
}

interface EditableCable {
  id: string;
  type: string; // Keep for backward compatibility
  cableType: 'R2V' | 'Prefile' | 'Coaxial' | 'RJ45';
  section: number;
  length_estimate: number;
}

interface EditableSurgeProtector {
  id: string;
  type: string;
  rating: string;
  quantity: number;
  description: string;
}

// Hybrid wizard type
type ProjectWithWizardData = Partial<
  Project &
    WizardProject & {
      rooms?: Room[];
      pieces?: Room[];
      dimensioning?: any;
    }
>;

interface StepDimensioningProps {
  onNext: () => void;
  onPrevious: () => void;
  projectData: ProjectWithWizardData;
  setProjectData: (data: ProjectWithWizardData) => void;
  /**
   * Callback used to inform the parent component (usually the route wrapper) that the step is
   * performing a long-running calculation. This allows the wrapper to hide navigation buttons
   * while the calculation is in progress so that the user cannot leave the page prematurely.
   */
  onLoadingChange?: (isLoading: boolean) => void;
}

export function StepDimensioning({
  onNext: _onNext,
  onPrevious: _onPrevious,
  projectData,
  setProjectData: _setProjectData,
  onLoadingChange,
}: StepDimensioningProps) {
  const rooms = projectData.pieces || projectData.rooms || [];
  const [result, setResult] = useState<
    GlobalValidationWithDimensioningResponseDtoContract | null
  >(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Editable data states
  const [circuitBreakers, setCircuitBreakers] = useState<EditableCircuitBreaker[]>([]);
  const [electricalPanels, setElectricalPanels] = useState<EditableElectricalPanel[]>([]);
  const [cables, setCables] = useState<EditableCable[]>([]);
  const [surgeProtectors, setSurgeProtectors] = useState<EditableSurgeProtector[]>([]);

  // Editing states
  const [editingCircuitBreaker, setEditingCircuitBreaker] = useState<string | null>(null);
  const [editingElectricalPanel, setEditingElectricalPanel] = useState<string | null>(null);
  const [editingCable, setEditingCable] = useState<string | null>(null);
  const [editingSurgeProtector, setEditingSurgeProtector] = useState<string | null>(null);

  // Flag to prevent auto-save during initialization
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Modal state for confirmation
  const [showRecalculateModal, setShowRecalculateModal] = useState(false);
  
  // Refs to track what has been loaded/calculated to prevent loops
  const hasLoadedSavedData = useRef(false);
  const projectIdRef = useRef<string | number | null>(null);

  const complianceDimensioning = useComplianceDimensioning();
  const updateProject = useUpdateProject();

  // Map room ID → room name for friendly display
  const roomNameById = React.useMemo(() => {
    const m = new Map<string, string>();
    rooms.forEach((r) => {
      if (r.id !== undefined && r.id !== null) {
        m.set(r.id.toString(), r.name || `Pièce ${r.id}`);
      }
    });
    return m;
  }, [rooms]);

  // Utility functions for managing editable data
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addCircuitBreaker = () => {
    const newId = generateId();
    setCircuitBreakers(prev => [...prev, {
      id: newId,
      description: 'Nouveau disjoncteur',
      rating: 16,
      quantity: 1
    }]);
    setEditingCircuitBreaker(newId);
  };

  const updateCircuitBreaker = (id: string, updates: Partial<EditableCircuitBreaker>) => {
    setCircuitBreakers(prev => prev.map(cb => 
      cb.id === id ? { ...cb, ...updates } : cb
    ));
  };

  const deleteCircuitBreaker = (id: string) => {
    setCircuitBreakers(prev => prev.filter(cb => cb.id !== id));
    setEditingCircuitBreaker(null);
  };

  const addElectricalPanel = () => {
    const newId = generateId();
    setElectricalPanels(prev => [...prev, {
      id: newId,
      type: 'Tableau principal',
      modules: 18
    }]);
    setEditingElectricalPanel(newId);
  };

  const updateElectricalPanel = (id: string, updates: Partial<EditableElectricalPanel>) => {
    setElectricalPanels(prev => prev.map(panel => 
      panel.id === id ? { ...panel, ...updates } : panel
    ));
  };

  const deleteElectricalPanel = (id: string) => {
    setElectricalPanels(prev => prev.filter(panel => panel.id !== id));
    setEditingElectricalPanel(null);
  };

  const addCable = () => {
    const newId = generateId();
    setCables(prev => [...prev, {
      id: newId,
      type: 'H07V-U',
      cableType: 'R2V',
      section: 2.5,
      length_estimate: 10
    }]);
    setEditingCable(newId);
  };

  const updateCable = (id: string, updates: Partial<EditableCable>) => {
    setCables(prev => prev.map(cable => 
      cable.id === id ? { ...cable, ...updates } : cable
    ));
  };

  const deleteCable = (id: string) => {
    setCables(prev => prev.filter(cable => cable.id !== id));
    setEditingCable(null);
  };

  const addSurgeProtector = () => {
    const newId = generateId();
    setSurgeProtectors(prev => [...prev, {
      id: newId,
      type: 'Parafoudre Type 2',
      rating: '40kA',
      quantity: 1,
      description: 'Protection contre les surtensions'
    }]);
    setEditingSurgeProtector(newId);
  };

  const updateSurgeProtector = (id: string, updates: Partial<EditableSurgeProtector>) => {
    setSurgeProtectors(prev => prev.map(sp => 
      sp.id === id ? { ...sp, ...updates } : sp
    ));
  };

  const deleteSurgeProtector = (id: string) => {
    setSurgeProtectors(prev => prev.filter(sp => sp.id !== id));
    setEditingSurgeProtector(null);
  };

  // Save edited data to project data and backend
  const saveEditedDataToProject = async () => {
    const dimensioningData = {
      circuit_breakers: circuitBreakers.map(cb => ({
        description: cb.description,
        rating: cb.rating,
        quantity: cb.quantity
      })),
      electrical_panels: electricalPanels.map(panel => ({
        type: panel.type,
        modules: panel.modules
      })),
      cables: cables.map(cable => ({
        type: cable.type,
        cableType: cable.cableType,
        section: cable.section,
        length_estimate: cable.length_estimate
      })),
      surge_protectors: surgeProtectors.map(sp => ({
        type: sp.type,
        rating: sp.rating,
        quantity: sp.quantity,
        description: sp.description
      })),
      installation_notes: result?.dimensioning?.installation_notes || []
    };

    // Update project data locally
    _setProjectData({
      ...projectData,
      dimensioning: dimensioningData
    });

    // Save to backend if we have a project ID
    if (projectData.id) {
      try {
        await updateProject.mutateAsync({
          projectId: projectData.id.toString(),
          data: {
            dimensioning_data: dimensioningData
          } as any
        });
        console.log('Dimensioning data saved to backend successfully');
      } catch (error) {
        console.error('Failed to save dimensioning data to backend:', error);
      }
    }
  };

  const saveCalculationResultToProject = async (calculationResult: GlobalValidationWithDimensioningResponseDtoContract) => {
    if (!calculationResult.dimensioning) return;

    setIsInitializing(true);

    const dimensioningData = {
      circuit_breakers: calculationResult.dimensioning.circuit_breakers.map(cb => ({
        description: cb.description,
        rating: cb.rating,
        quantity: cb.quantity
      })),
      electrical_panels: calculationResult.dimensioning.electrical_panels.map(panel => ({
        type: panel.type,
        modules: panel.modules
      })),
      cables: calculationResult.dimensioning.cables.map(cable => ({
        type: cable.type,
        cableType: cable.type?.includes('RJ45') ? 'RJ45' : 
                   cable.type?.includes('Coaxial') ? 'Coaxial' : 'R2V',
        section: cable.section,
        length_estimate: cable.length_estimate
      })),
      surge_protectors: (calculationResult.dimensioning as any).surge_protectors?.map((sp: any) => ({
        type: sp.type,
        rating: sp.rating || 'N/A',
        quantity: sp.quantity,
        description: sp.description
      })) || [],
      installation_notes: calculationResult.dimensioning.installation_notes || []
    };

    // Update local state with new calculation results
    const newCircuitBreakers = calculationResult.dimensioning.circuit_breakers.map((cb: any, index: number) => ({
      id: `cb-${index}`,
      description: cb.description,
      rating: cb.rating,
      quantity: cb.quantity
    }));
    setCircuitBreakers(newCircuitBreakers);

    const newElectricalPanels = calculationResult.dimensioning.electrical_panels.map((panel: any, index: number) => ({
      id: `panel-${index}`,
      type: panel.type,
      modules: panel.modules
    }));
    setElectricalPanels(newElectricalPanels);

    const newCables = calculationResult.dimensioning.cables.map((cable: any, index: number) => ({
      id: `cable-${index}`,
      type: cable.type,
      cableType: cable.type?.includes('RJ45') ? 'RJ45' as const : 
                 cable.type?.includes('Coaxial') ? 'Coaxial' as const : 'R2V' as const,
      section: cable.section,
      length_estimate: cable.length_estimate
    }));
    setCables(newCables);

    if ((calculationResult.dimensioning as any).surge_protectors) {
      const newSurgeProtectors = (calculationResult.dimensioning as any).surge_protectors.map((sp: any, index: number) => ({
        id: `sp-${index}`,
        type: sp.type,
        rating: sp.rating || 'N/A',
        quantity: sp.quantity,
        description: sp.description
      }));
      setSurgeProtectors(newSurgeProtectors);
    } else {
      setSurgeProtectors([]);
    }

    // Update project data locally
    _setProjectData({
      ...projectData,
      dimensioning: dimensioningData
    });

    // Force refs to indicate data has been loaded to prevent useEffect conflicts
    hasLoadedSavedData.current = true;
    if (projectData.id) {
      projectIdRef.current = projectData.id;
    }

    // Reset initialization flag - let the auto-save useEffect handle the backend save
    setTimeout(() => setIsInitializing(false), 100);
  };

  // Auto-save when data changes (but not during initialization)
  useEffect(() => {
    if (!isInitializing && (circuitBreakers.length > 0 || electricalPanels.length > 0 || cables.length > 0 || surgeProtectors.length > 0)) {
      saveEditedDataToProject();
    }
  }, [circuitBreakers, electricalPanels, cables, surgeProtectors, isInitializing]);

  const prettifyDescription = (desc: string): string => {
    // Replace occurrences of "pièce <id>" by the room name if available
    let result = desc.replace(/(\d+)/gi, (_, id: string) => {
      const friendly = roomNameById.get(id);
      return friendly ? `${friendly}` : _; // fall back to original
    });

    // Dictionary for translating English equipment terms to French
    const equipmentTranslations: Record<string, string> = {
      // Socket types
      'SimpleSocket': 'prise simple',
      'DoubleSocket': 'prise double',
      'WaterproofSocket': 'prise étanche',
      'NetworkSocket': 'prise RJ45',
      'TVSocket': 'prise TV',
      'OvenSocket': 'prise four',
      'ExtractorSocket': 'prise hotte',
      'Dedicated20ASocket': 'prise dédiée 20A',
      'SOCKET': 'prise',
      
      // Lighting
      'LightingPoint': 'point lumineux',
      'SimpleSwitch': 'interrupteur simple',
      'DoubleSwitch': 'interrupteur double',
      'DimmerSwitch': 'va-et-vient',
      'LIGHTING_POINT': 'point lumineux',
      'SWITCH': 'interrupteur',
      
      // Heating
      'InertiaRadiator': 'radiateur inertie',
      'Convector': 'convecteur',
      'AirConditioning': 'climatisation',
      'FloorHeating': 'plancher chauffant',
      'DuctedHeatPump': 'pompe à chaleur gainée',
      'CONVECTOR': 'convecteur',
      'INERTIA_RADIATOR': 'radiateur inertie',
      'AIR_CONDITIONING': 'climatisation',
      'FLOOR_HEATING': 'plancher chauffant',
      'DUCTED_HEAT_PUMP': 'pompe à chaleur gainée',
      
      // Water heating
      'WaterHeater': 'chauffe-eau',
      'WATER_HEATER': 'chauffe-eau',
      'ELECTRIC_WATER_HEATER': 'chauffe-eau électrique',
      'INSTANTANEOUS_WATER_HEATER': 'chauffe-eau instantané',
      'STORAGE_WATER_HEATER': 'chauffe-eau à accumulation',
      
      // VMC
      'SimpleFlowVMC': 'VMC simple flux',
      'DoubleFlowVMC': 'VMC double flux',
      'VMC': 'VMC',
      'SIMPLE_FLOW_VMC': 'VMC simple flux',
      'DOUBLE_FLOW_VMC': 'VMC double flux',
      
      // Kitchen appliances
      'DISHWASHER': 'lave-vaisselle',
      'WASHING_MACHINE': 'lave-linge',
      'DRYER': 'sèche-linge',
      'ELECTRIC_OVEN': 'four électrique',
      'COOKING_HOB': 'plaque de cuisson',
      
      // Technical terms
      'circuit_breaker': 'disjoncteur',
      'Circuit': 'circuit',
      'Type C': 'courbe C',
      'surge_protector': 'parafoudre',
      'electrical_panel': 'tableau électrique',
      'cable': 'câble',
      'wire_section': 'section de câble',
      'protection': 'protection',
      'grounding': 'mise à la terre',
    };

    // Apply translations
    Object.entries(equipmentTranslations).forEach(([english, french]) => {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      result = result.replace(regex, french);
    });

    // Additional specific replacements for common patterns
    result = result
      // Equipment patterns with underscores - only apply to known equipment terms
      .replace(/\b([A-Z_]+)\b/g, (match) => {
        const translation = equipmentTranslations[match];
        if (translation) {
          return translation;
        }
        // Only lowercase if it looks like an equipment code (contains underscores or is all caps with 3+ chars)
        if (match.includes('_') || (match.length >= 3 && /^[A-Z]+$/.test(match))) {
          return match.toLowerCase().replace(/_/g, ' ');
        }
        return match; // Keep original case for other words
      })
      // Circuit patterns
      .replace(/Circuit\s+([A-Z_]+)/gi, (match, equipment) => {
        const translation = equipmentTranslations[equipment];
        return `Circuit ${translation || equipment.toLowerCase().replace(/_/g, ' ')}`;
      })
      // Rating patterns
      .replace(/(\d+)A\s+(circuit|breaker)/gi, '$1A $2')
      // Power patterns
      .replace(/(\d+)W/gi, '$1W')
      // Area patterns
      .replace(/(\d+)m²/gi, '$1 m²')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();

    return result;
  };

  const getEquipmentsByRoom = (roomId: string) => {
    return projectData.equipments?.filter((eq) => eq.roomId === roomId) || [];
  };

  const transformToComplianceData = (): ComplianceDimensioningParams | null => {
    if (!projectData.id || rooms.length === 0) return null;

    // Map frontend room types to backend compliance API room types
    const mapRoomType = (frontendRoomType: string): string => {
      const roomTypeMapping: Record<string, string> = {
        'Chambre/Bureau': 'Bedroom',
        'Salon/Séjour': 'LivingRoom',
        'Salon/Séjour avec cuisine intégré': 'LivingRoomWithIntegratedKitchen',
        Cuisine: 'Kitchen',
        "Salle d'eau": 'WetRoom',
        WC: 'WC',
        "Salle d'eau avec WC": 'BathroomWithWC',
        'Circulation et locaux ≥ 4 m²': 'CirculationArea',
        'Autres (garage, dégagement < 4 m2, placard…)': 'Other',
        'Extérieur (terrasse, patio…)': 'ExteriorSpace',
      };

      return roomTypeMapping[frontendRoomType] || frontendRoomType;
    };

    return {
      installation_id: projectData.id.toString(),
      // postal_code: projectData.codePostal, // Temporarily commented out - field not recognized by API
      ...(projectData.numberOfPeople !== undefined && { number_of_people: projectData.numberOfPeople }),
      '@context': {
        '@vocab': 'http://example.org/nfc15100#',
        installation: 'Installation',
        room: 'Room',
        equipment: 'Equipment',
      },
      rooms: rooms.map((room) => {
        const equipments = getEquipmentsByRoom(room.id?.toString() || '');
        const mappedRoomType = mapRoomType((room as any).options.roomType || 'Other');

        return {
          room_id: room.id?.toString() || '',
          room_type: mappedRoomType,
          room_area: room.surface,
          equipment: equipments.map((eq) => ({
            equipment_type: eq.type || 'SimpleSocket',
            quantity: eq.quantity,
            specifications: (eq as any).options || {},
          })),
        };
      }),
    };
  };

  // Function to handle button click and decide whether to show modal or calculate directly
  const handleRecalculateDimensioning = () => {
    const hasCustomizations = circuitBreakers.length > 0 || electricalPanels.length > 0 || cables.length > 0 || surgeProtectors.length > 0;
    
    if (hasCustomizations && hasCalculated) {
      setShowRecalculateModal(true);
    } else {
      // If no customizations or hasn't calculated yet, calculate directly
      performCalculateDimensioning();
    }
  };

  // Function that performs the actual calculation
  const performCalculateDimensioning = async () => {
    const data = transformToComplianceData();
    if (!data) return;

    onLoadingChange?.(true);
    setIsCalculating(true);
    setCalculationError(null);
    try {
      const res = await complianceDimensioning.mutateAsync(data);
      setResult(res);
      setHasCalculated(true);
      
      // Auto-save the new calculation results directly from the response
      console.log('Auto-saving new dimensioning calculation results');
      await saveCalculationResultToProject(res);
    } catch (e: any) {
      console.error('Dimensioning calculation failed', e);
      
      // Extract detailed error information
      let errorMessage = 'Erreur lors du calcul de dimensionnement';
      
      if (e?.response?.data) {
        const errorData = e.response.data;
        if (errorData.detail) {
          errorMessage = `Erreur de validation: ${errorData.detail}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      setCalculationError(errorMessage);
    } finally {
      setIsCalculating(false);
      onLoadingChange?.(false);
    }
  };

  // Legacy function name for backward compatibility
  const calculateDimensioning = performCalculateDimensioning;

  // Load existing dimensioning data on mount (only once per project)
  useEffect(() => {
    const projectId = projectData.id;
    const savedDimensioningData = projectData.dimensioning || (projectData as any).dimensioning_data;
    
    // Only load once per project and if data hasn't been loaded yet
    if (savedDimensioningData && !hasLoadedSavedData.current && projectId && projectIdRef.current !== projectId) {
      console.log('Loading existing dimensioning data:', savedDimensioningData);
      setIsInitializing(true);
      
      // Load saved circuit breakers
      if (savedDimensioningData.circuit_breakers) {
        const savedCircuitBreakers = savedDimensioningData.circuit_breakers.map((cb: any, index: number) => ({
          id: `cb-${index}`,
          description: cb.description,
          rating: cb.rating,
          quantity: cb.quantity
        }));
        setCircuitBreakers(savedCircuitBreakers);
      }
      
      // Load saved electrical panels
      if (savedDimensioningData.electrical_panels) {
        const savedElectricalPanels = savedDimensioningData.electrical_panels.map((panel: any, index: number) => ({
          id: `panel-${index}`,
          type: panel.type,
          modules: panel.modules
        }));
        setElectricalPanels(savedElectricalPanels);
      }
      
      // Load saved cables
      if (savedDimensioningData.cables) {
        const savedCables = savedDimensioningData.cables.map((cable: any, index: number) => ({
          id: `cable-${index}`,
          type: cable.type,
          cableType: cable.cableType || (cable.type?.includes('RJ45') ? 'RJ45' as const : 
                     cable.type?.includes('Coaxial') ? 'Coaxial' as const : 'R2V' as const),
          section: cable.section,
          length_estimate: cable.length_estimate
        }));
        setCables(savedCables);
      }
      
      // Load saved surge protectors
      if (savedDimensioningData.surge_protectors) {
        const savedSurgeProtectors = savedDimensioningData.surge_protectors.map((sp: any, index: number) => ({
          id: `sp-${index}`,
          type: sp.type,
          rating: sp.rating || 'N/A',
          quantity: sp.quantity,
          description: sp.description
        }));
        setSurgeProtectors(savedSurgeProtectors);
      }
      
      setHasCalculated(true); // Mark as already calculated to prevent auto-run
      hasLoadedSavedData.current = true;
      projectIdRef.current = projectId;
      setTimeout(() => setIsInitializing(false), 100);
    }
  }, [projectData.id, projectData.dimensioning, (projectData as any).dimensioning_data]);

  // Auto run on mount (only if no saved data exists)
  useEffect(() => {
    const projectId = projectData.id;
    const savedDimensioningData = projectData.dimensioning || (projectData as any).dimensioning_data;
    const hasSavedData = savedDimensioningData && (
      savedDimensioningData.circuit_breakers?.length > 0 ||
      savedDimensioningData.electrical_panels?.length > 0 ||
      savedDimensioningData.cables?.length > 0 ||
      savedDimensioningData.surge_protectors?.length > 0
    );

    // Only auto-calculate if:
    // - Haven't calculated yet
    // - Not currently calculating
    // - Have rooms data
    // - No saved data exists
    // - This is a new project or we haven't loaded saved data yet
    if (!hasCalculated && !isCalculating && rooms.length > 0 && !hasSavedData && projectId && projectIdRef.current !== projectId) {
      console.log('No saved dimensioning data found, running auto-calculation');
      calculateDimensioning();
      projectIdRef.current = projectId;
    }
  }, [rooms.length, hasCalculated, isCalculating, projectData.id]);

  // Initialize editable data from calculation results (only if not already loaded from saved data)
  useEffect(() => {
    if (result && result.dimensioning && !hasLoadedSavedData.current) {
      setIsInitializing(true);
      
      // Initialize circuit breakers
      const initialCircuitBreakers = result.dimensioning.circuit_breakers.map((cb: any, index: number) => ({
        id: `cb-${index}`,
        description: cb.description,
        rating: cb.rating,
        quantity: cb.quantity
      }));
      setCircuitBreakers(initialCircuitBreakers);

      // Initialize electrical panels
      const initialElectricalPanels = result.dimensioning.electrical_panels.map((panel: any, index: number) => ({
        id: `panel-${index}`,
        type: panel.type,
        modules: panel.modules
      }));
      setElectricalPanels(initialElectricalPanels);

      // Initialize cables
      const initialCables = result.dimensioning.cables.map((cable: any, index: number) => ({
        id: `cable-${index}`,
        type: cable.type,
        cableType: cable.type?.includes('RJ45') ? 'RJ45' as const : 
                   cable.type?.includes('Coaxial') ? 'Coaxial' as const : 'R2V' as const,
        section: cable.section,
        length_estimate: cable.length_estimate
      }));
      setCables(initialCables);

      // Initialize surge protectors
      if ((result.dimensioning as any).surge_protectors) {
        const initialSurgeProtectors = (result.dimensioning as any).surge_protectors.map((sp: any, index: number) => ({
          id: `sp-${index}`,
          type: sp.type,
          rating: sp.rating || 'N/A',
          quantity: sp.quantity,
          description: sp.description
        }));
        setSurgeProtectors(initialSurgeProtectors);
      }
      
      // Reset the flag after initialization - data will be saved by calculateDimensioning
      setTimeout(() => setIsInitializing(false), 100);
    }
  }, [result]);

  // Reset refs when project changes
  useEffect(() => {
    const currentProjectId = projectData.id;
    if (currentProjectId && projectIdRef.current && projectIdRef.current !== currentProjectId) {
      // Reset all tracking when switching projects
      hasLoadedSavedData.current = false;
      setHasCalculated(false);
      setCircuitBreakers([]);
      setElectricalPanels([]);
      setCables([]);
      setSurgeProtectors([]);
      setResult(null);
    }
  }, [projectData.id]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleRecalculateDimensioning}
          disabled={isCalculating || rooms.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${isCalculating ? 'animate-spin' : ''}`} />
          {isCalculating ? 'Calcul en cours...' : hasCalculated ? 'Recalculer le dimensionnement' : 'Calculer le dimensionnement'}
        </button>
      </div>


      {isCalculating && (
        <div className="flex flex-col items-center justify-center py-16 text-blue-600 text-lg">
          <RefreshCw className="w-6 h-6 mb-4 animate-spin" />
          Calcul du dimensionnement en cours...
        </div>
      )}

      {(result || circuitBreakers.length > 0 || electricalPanels.length > 0 || cables.length > 0 || surgeProtectors.length > 0) && (
        <div className="space-y-6">
          {/* Circuit breakers */}
          <section>
            <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-gray-600" />
              Disjoncteurs
            </h3>
              <button
                onClick={addCircuitBreaker}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calibre (A)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {circuitBreakers.map((cb) => (
                    <tr key={cb.id}>
                      <td className="px-4 py-2">
                        {editingCircuitBreaker === cb.id ? (
                          <input
                            type="text"
                            value={cb.description}
                            onChange={(e) => updateCircuitBreaker(cb.id, { description: e.target.value })}
                            className="w-full px-2 py-1 text-sm border rounded"
                            autoFocus
                          />
                        ) : (
                          <span>{prettifyDescription(cb.description)}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingCircuitBreaker === cb.id ? (
                          <select
                            value={cb.rating}
                            onChange={(e) => updateCircuitBreaker(cb.id, { rating: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 text-sm border rounded"
                          >
                            <option value={1}>1 A</option>
                            <option value={2}>2 A</option>
                            <option value={3}>3 A</option>
                            <option value={4}>4 A</option>
                            <option value={6}>6 A</option>
                            <option value={10}>10 A</option>
                            <option value={16}>16 A</option>
                            <option value={20}>20 A</option>
                            <option value={25}>25 A</option>
                            <option value={32}>32 A</option>
                            <option value={40}>40 A</option>
                            <option value={50}>50 A</option>
                            <option value={63}>63 A</option>
                          </select>
                        ) : (
                          <span>{cb.rating} A</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingCircuitBreaker === cb.id ? (
                          <input
                            type="number"
                            value={cb.quantity}
                            onChange={(e) => updateCircuitBreaker(cb.id, { quantity: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 text-sm border rounded"
                            min="1"
                          />
                        ) : (
                          <span>{cb.quantity}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          {editingCircuitBreaker === cb.id ? (
                            <>
                              <button
                                onClick={() => setEditingCircuitBreaker(null)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Sauvegarder"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingCircuitBreaker(null)}
                                className="p-1 text-gray-600 hover:text-gray-800"
                                title="Annuler"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingCircuitBreaker(cb.id)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteCircuitBreaker(cb.id)}
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
          </section>

          {/* Tableaux électriques */}
          <section>
            <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CircuitBoard className="w-5 h-5 text-gray-600" />
              Tableaux électriques
            </h3>
              <button
                onClick={addElectricalPanel}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modules
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {electricalPanels.map((panel) => (
                    <tr key={panel.id}>
                      <td className="px-4 py-2">
                        {editingElectricalPanel === panel.id ? (
                          <input
                            type="text"
                            value={panel.type}
                            onChange={(e) => updateElectricalPanel(panel.id, { type: e.target.value })}
                            className="w-full px-2 py-1 text-sm border rounded"
                            autoFocus
                          />
                        ) : (
                          <span>{panel.type}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingElectricalPanel === panel.id ? (
                          <input
                            type="number"
                            value={panel.modules}
                            onChange={(e) => updateElectricalPanel(panel.id, { modules: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 text-sm border rounded"
                            min="1"
                          />
                        ) : (
                          <span>{panel.modules} modules</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          {editingElectricalPanel === panel.id ? (
                            <>
                              <button
                                onClick={() => setEditingElectricalPanel(null)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Sauvegarder"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingElectricalPanel(null)}
                                className="p-1 text-gray-600 hover:text-gray-800"
                                title="Annuler"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingElectricalPanel(panel.id)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteElectricalPanel(panel.id)}
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
          </section>

          {/* Cables */}
          <section>
            <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Cable className="w-5 h-5 text-gray-600" />
              Câbles estimés
            </h3>
              <button
                onClick={addCable}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type de câble
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section (mm²)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Longueur estimée (m)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {cables.map((cable) => (
                    <tr key={cable.id}>
                      <td className="px-4 py-2">
                        {editingCable === cable.id ? (
                          <select
                            value={cable.cableType}
                            onChange={(e) => updateCable(cable.id, { cableType: e.target.value as 'R2V' | 'Prefile' | 'Coaxial' | 'RJ45' })}
                            className="w-full px-2 py-1 text-sm border rounded"
                            autoFocus
                          >
                            <option value="R2V">R2V</option>
                            <option value="Prefile">Prefile</option>
                            <option value="Coaxial">Coaxial</option>
                            <option value="RJ45">RJ45</option>
                          </select>
                        ) : (
                          <span>{cable.cableType}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingCable === cable.id ? (
                          <select
                            value={cable.section}
                            onChange={(e) => updateCable(cable.id, { section: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 text-sm border rounded"
                            disabled={cable.cableType === 'Coaxial' || cable.cableType === 'RJ45'}
                          >
                            <option value="0">N/A</option>
                            {cable.cableType === 'R2V' && (
                              <>
                                <option value="1.5">1.5</option>
                                <option value="2.5">2.5</option>
                                <option value="4">4</option>
                                <option value="6">6</option>
                                <option value="10">10</option>
                              </>
                            )}
                            {cable.cableType === 'Prefile' && (
                              <>
                                <option value="1.5">1.5</option>
                                <option value="2.5">2.5</option>
                                <option value="6">6</option>
                              </>
                            )}
                          </select>
                        ) : (
                          <span>{cable.section === 0 ? 'N/A' : cable.section}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingCable === cable.id ? (
                          <input
                            type="number"
                            value={cable.length_estimate}
                            onChange={(e) => updateCable(cable.id, { length_estimate: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 text-sm border rounded"
                            min="0"
                            step="0.1"
                          />
                        ) : (
                          <span>{cable.length_estimate}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          {editingCable === cable.id ? (
                            <>
                              <button
                                onClick={() => setEditingCable(null)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Sauvegarder"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingCable(null)}
                                className="p-1 text-gray-600 hover:text-gray-800"
                                title="Annuler"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingCable(cable.id)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteCable(cable.id)}
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
          </section>
          {/* Surge protectors */}
          {surgeProtectors.length > 0 && (
            <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600" />
                Parafoudres
              </h3>
              <button
                onClick={addSurgeProtector}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calibre
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {surgeProtectors.map((sp) => (
                      <tr key={sp.id}>
                        <td className="px-4 py-2">
                          {editingSurgeProtector === sp.id ? (
                            <select
                              value={sp.type}
                              onChange={(e) => updateSurgeProtector(sp.id, { type: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded"
                              autoFocus
                            >
                              <option value="Parafoudre Type 1">Parafoudre Type 1</option>
                              <option value="Parafoudre Type 2">Parafoudre Type 2</option>
                              <option value="Parafoudre Type 3">Parafoudre Type 3</option>
                              <option value="Parafoudre Type 1+2">Parafoudre Type 1+2</option>
                            </select>
                          ) : (
                            <span>{sp.type}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editingSurgeProtector === sp.id ? (
                            <input
                              type="text"
                              value={sp.rating}
                              onChange={(e) => updateSurgeProtector(sp.id, { rating: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded"
                              placeholder="Ex: 40kA"
                            />
                          ) : (
                            <span>{sp.rating}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editingSurgeProtector === sp.id ? (
                            <input
                              type="number"
                              value={sp.quantity}
                              onChange={(e) => updateSurgeProtector(sp.id, { quantity: parseInt(e.target.value) || 0 })}
                              className="w-full px-2 py-1 text-sm border rounded"
                              min="1"
                            />
                          ) : (
                            <span>{sp.quantity}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editingSurgeProtector === sp.id ? (
                            <input
                              type="text"
                              value={sp.description}
                              onChange={(e) => updateSurgeProtector(sp.id, { description: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded"
                            />
                          ) : (
                            <span>{sp.description}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            {editingSurgeProtector === sp.id ? (
                              <>
                                <button
                                  onClick={() => setEditingSurgeProtector(null)}
                                  className="p-1 text-green-600 hover:text-green-800"
                                  title="Sauvegarder"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingSurgeProtector(null)}
                                  className="p-1 text-gray-600 hover:text-gray-800"
                                  title="Annuler"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingSurgeProtector(sp.id)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteSurgeProtector(sp.id)}
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
            </section>
            )}
          {/* Installation notes */}
          {result && result.dimensioning.installation_notes?.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-600" />
                Notes d'installation
              </h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                {result.dimensioning.installation_notes.map((note, idx) => (
                  <li key={idx}>{prettifyDescription(note)}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* The navigation buttons are handled by ProjectStepLayout */}

      {/* Modale de confirmation pour le recalcul du dimensionnement */}
      <ConfirmRecalculateDimensioningModal
        isOpen={showRecalculateModal}
        onClose={() => setShowRecalculateModal(false)}
        onConfirm={performCalculateDimensioning}
      />
    </div>
  );
} 
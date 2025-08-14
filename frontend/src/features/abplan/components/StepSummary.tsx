import { Check, AlertTriangle, Building2, Lightbulb, Settings2, Pencil, X } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { Project as WizardProject, Room, Equipment } from '../types';
import type { Project, PlanFile } from '@/modules/abplan/projects/domain/project.entity';
import { PlanViewer } from './shared/PlanViewer';
import { getRoomTypeByType } from '../constants/room-types';
import { useComplianceValidation, type ComplianceValidationParams } from '@/features/shared/hooks/compliance/useComplianceValidation';
import { RoomEquipmentValidationResponseDtoContract, RoomResultDtoContract } from '@/api/generated/data-contracts';
import { useUpdateProjectEquipmentsSilent } from '@/features/shared/hooks/project-equipments/useUpdateProjectEquipments';
import { equipmentsToBackend } from '@/features/shared/utils/equipmentsToBackend';
import { optionsToEquipments } from '@/features/shared/utils/optionsToEquipments';
import { StepEquipments } from './StepEquipments';
import { ComplianceVerificationSection } from './shared/ComplianceVerificationSection';
import { hasComplianceSuggestions, applyComplianceSuggestions } from '@/features/shared/utils/complianceSuggestions';

// Type hybride pour le wizard qui combine les deux types
type ProjectWithWizardData = Partial<Project & WizardProject & {
  rooms?: Room[];
  pieces?: Room[];
  planFiles?: PlanFile[];
}>;

interface StepSummaryProps {
  onNext: () => void;
  onPrevious: () => void;
  projectData: ProjectWithWizardData;
  setProjectData: (data: ProjectWithWizardData) => void;
  /**
   * Callback triggered each time the global compliance status is (re)computed.
   * The parent component can use it – for example – to disable the "Suivant"
   * button when the installation is not compliant.
   */
  onComplianceStatusChange?: (isGloballyCompliant: boolean | null) => void;
}

export function StepSummary({ onNext, onPrevious, projectData, setProjectData, onComplianceStatusChange }: StepSummaryProps) {
  const rooms = projectData.pieces || projectData.rooms || [];
  const totalSurface = rooms.reduce((acc: number, room: Room) => acc + room.surface, 0);
  const totalEquipments = projectData.equipments?.reduce((acc: number, eq: Equipment) => acc + eq.quantity, 0) || 0;

  // Compliance validation state
  const [complianceResult, setComplianceResult] = useState<RoomEquipmentValidationResponseDtoContract | null>(null);
  // Signature (rooms+equipments) correspondant à complianceResult pour détecter la
  // désynchronisation lorsque l'utilisateur modifie les données très rapidement.
  const complianceResultSignature = useRef<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [isApplyingSuggestions, setIsApplyingSuggestions] = useState(false);
  const [complianceError, setComplianceError] = useState<string | null>(null);
  // Modal state for editing equipments
  const [isEquipmentsModalOpen, setIsEquipmentsModalOpen] = useState(false);
  // Track which room is being edited in the equipments modal (null = default / first room)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  
  const complianceValidation = useComplianceValidation();
  const updateProjectEquipments = useUpdateProjectEquipmentsSilent();

  // Keep track of the data snapshot that was last validated to avoid
  // triggering the compliance API multiple times for the same state.
  const lastValidatedSignature = useRef<string | null>(null);

  const getEquipmentsByRoom = (roomId: string) => {
    return projectData.equipments?.filter((eq: Equipment) => eq.roomId === roomId) || [];
  };

  /**
   * Build the payload for the compliance engine.
   *
   * @param equipmentsOverride – If provided, this list is used instead of the equipments present in the projectData
   *                            state. This is useful right after we locally update the equipments but before React
   *                            has had the time to propagate the new state – e.g. just after "Appliquer les suggestions".
   */
  const transformToComplianceData = (equipmentsOverride?: Equipment[]): ComplianceValidationParams | null => {
    if (!projectData.id || rooms.length === 0) return null;

    // Map frontend room types to backend compliance API room types
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
      rooms: rooms.map((room: Room) => {
        // Use the freshest equipments list possible (from the override or from state)
        const equipmentsSource = equipmentsOverride ?? projectData.equipments ?? [];
        const equipments = equipmentsSource.filter((eq: Equipment) => eq.roomId === (room.id?.toString() || ''));
        const mappedRoomType = mapRoomType((room as any).options.roomType || 'Other');
        const roomData = {
          room_id: room.id?.toString() || '',
          room_type: mappedRoomType,
          room_area: room.surface,
          equipment: equipments.map((eq: Equipment) => ({
            equipment_type: eq.type || 'SimpleSocket',
            quantity: eq.quantity,
            specifications: (eq as any).options || {}
          }))
        };
        
        console.log(`[transformToComplianceData] Room ${roomData.room_id} "${room.roomType}" -> "${mappedRoomType}":`, roomData.equipment);
        return roomData;
      })
    };

    console.log('[transformToComplianceData] Sending compliance data:', complianceData);
    return complianceData;
  };

  /**
   * Trigger a compliance check.
   *
   * @param equipmentsOverride – Optional fresh equipments list to use for the validation (see transformToComplianceData).
   */
  const validateCompliance = async (equipmentsOverride?: Equipment[]) => {
    const complianceData = transformToComplianceData(equipmentsOverride);
    if (!complianceData) return;

    // Update the memoized signature (rooms + equipments) before the call so
    // that concurrent state changes don't schedule another identical call.
    lastValidatedSignature.current = JSON.stringify({
      rooms: rooms.map(r => ({ id: r.id, surface: r.surface, type: r.roomType })),
      equipments: (equipmentsOverride ?? projectData.equipments) ?? []
    });

    setIsValidating(true);
    setComplianceError(null);
    try {
      const result = await complianceValidation.mutateAsync(complianceData);
      setComplianceResult(result);
      complianceResultSignature.current = JSON.stringify({
        rooms: rooms.map(r => ({ id: r.id, surface: r.surface, type: r.roomType })),
        equipments: projectData.equipments ?? []
      });
      setHasValidated(true);
    } catch (error: any) {
      console.error('Compliance validation failed:', error);
      
      // Extract detailed error information
      let errorMessage = 'Erreur lors de la validation de conformité';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          errorMessage = `Erreur de validation: ${errorData.detail}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setComplianceError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  // Function to trigger compliance validation after modal close
  const triggerComplianceValidation = () => {
    console.log('[StepSummary] Triggering compliance validation after modal close');
    // Reset validation state to force a new validation
    setHasValidated(false);
    setComplianceError(null);
    setIsValidating(false); // Ensure we're not stuck in validating state
    // Note: Don't reset complianceResult here to keep the suggestions button visible
    // The useEffect will automatically trigger validateCompliance when hasValidated becomes false
  };

  // Auto-validate on component mount if not yet validated, or when hasValidated changes to false
  useEffect(() => {
    if (!hasValidated && !isValidating && rooms.length > 0) {
      console.log('[useEffect] Triggering compliance validation');
      validateCompliance();
    }
  }, [hasValidated, isValidating, rooms.length]);

  // Reset validation flags when starting a new validation cycle
  useEffect(() => {
    if (!hasValidated && !isValidating) {
      console.log('[useEffect] Resetting validation states for new validation cycle');
      // Reset the signature to avoid stale result detection during validation
      complianceResultSignature.current = null;
      lastValidatedSignature.current = null;
    }
  }, [hasValidated, isValidating]);

  // Get compliance status for a specific room
  const getRoomComplianceStatus = (roomId: string): RoomResultDtoContract | null => {
    if (!complianceResult?.room_results) return null;
    return complianceResult.room_results.find(r => r.room_id === roomId) || null;
  };

  // Translate equipment types from English to French
  const translateEquipmentType = (missingEquipmentType: string): string => {
    // Parse the missing equipment string to extract quantity and type
    // Examples: "2 socket(s)", "1 network socket(s)", "1 lighting point(s)"
    const quantityMatch = missingEquipmentType.match(/^(\d+)\s+(.+?)(?:\(s\))?$/);
    let quantity = 1;
    let equipmentTypeStr = missingEquipmentType;
    
    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1], 10);
      equipmentTypeStr = quantityMatch[2].trim();
    }

    // Map missing equipment types to French names (comprehensive dictionary)
    const equipmentTranslations: Record<string, string> = {
      // Prises électriques
      'socket': 'prise simple',
      'sockets': 'prises simples',
      'simple_socket': 'prise simple',
      'double_socket': 'prise double',
      'waterproof_socket': 'prise étanche',
      'oven_socket': 'prise four',
      'extractor_socket': 'prise hotte',
      'dedicated_20a_socket': 'prise dédiée 20A',
      '32a socket': 'prise 32A plaque',
      '32a sockets': 'prises 32A plaque',
      'prise_simple': 'prise simple',
      'prise': 'prise simple',
      'outlet': 'prise simple',
      'SimpleSocket': 'prise simple',
      'DoubleSocket': 'prise double',
      'WaterproofSocket': 'prise étanche',
      'OvenSocket': 'prise four',
      'ExtractorSocket': 'prise hotte',
      'Dedicated20ASocket': 'prise dédiée 20A',
      'SOCKET': 'prise',
      
      // Prises réseau
      'network_socket': 'prise RJ45',
      'network sockets': 'prises RJ45',
      'rj45': 'prise RJ45',
      'prise_rj45': 'prise RJ45',
      'prise_reseau': 'prise RJ45',
      'ethernet': 'prise RJ45',
      'NetworkSocket': 'prise RJ45',
      'NETWORK_SOCKET': 'prise RJ45',
      
      // Prises TV
      'tv_socket': 'prise TV',
      'television_socket': 'prise TV',
      'TVSocket': 'prise TV',
      'TV_SOCKET': 'prise TV',
      
      // Éclairage
      'lighting_point': 'point lumineux',
      'lighting points': 'points lumineux',
      'point_lumineux': 'point lumineux',
      'light': 'point lumineux',
      'eclairage': 'point lumineux',
      'luminaire': 'point lumineux',
      'LightingPoint': 'point lumineux',
      'LIGHTING_POINT': 'point lumineux',
      
      // Interrupteurs
      'switch': 'interrupteur simple',
      'switches': 'interrupteurs simples',
      'simple_switch': 'interrupteur simple',
      'double_switch': 'interrupteur double',
      'dimmer_switch': 'va-et-vient',
      'interrupteur': 'interrupteur simple',
      'interrupteur_simple': 'interrupteur simple',
      'commande': 'interrupteur simple',
      'SimpleSwitch': 'interrupteur simple',
      'DoubleSwitch': 'interrupteur double',
      'DimmerSwitch': 'va-et-vient',
      'SWITCH': 'interrupteur',
      
      // Chauffage
      'inertia_radiator': 'radiateur inertie',
      'convector': 'convecteur',
      'air_conditioning': 'climatisation',
      'floor_heating': 'plancher chauffant',
      'ducted_heat_pump': 'pompe à chaleur gainée',
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
      
      // Chauffe-eau
      'water_heater': 'chauffe-eau',
      'electric_water_heater': 'chauffe-eau électrique',
      'instantaneous_water_heater': 'chauffe-eau instantané',
      'storage_water_heater': 'chauffe-eau à accumulation',
      'WaterHeater': 'chauffe-eau',
      'WATER_HEATER': 'chauffe-eau',
      'ELECTRIC_WATER_HEATER': 'chauffe-eau électrique',
      
      // VMC
      'simple_flow_vmc': 'VMC simple flux',
      'double_flow_vmc': 'VMC double flux',
      'vmc': 'VMC',
      'SimpleFlowVMC': 'VMC simple flux',
      'DoubleFlowVMC': 'VMC double flux',
      'VMC': 'VMC',
      'SIMPLE_FLOW_VMC': 'VMC simple flux',
      'DOUBLE_FLOW_VMC': 'VMC double flux',
      
      // Électroménager cuisine
      'dishwasher': 'lave-vaisselle',
      'washing_machine': 'lave-linge',
      'dryer': 'sèche-linge',
      'electric_oven': 'four électrique',
      'cooking_hob': 'plaque de cuisson',
      'DISHWASHER': 'lave-vaisselle',
      'WASHING_MACHINE': 'lave-linge',
      'DRYER': 'sèche-linge',
      'ELECTRIC_OVEN': 'four électrique',
      'COOKING_HOB': 'plaque de cuisson',
    };

    // Normalize the equipment type for better matching
    const normalizedType = equipmentTypeStr.toLowerCase()
      .replace(/[^a-z0-9\s_]/g, '')
      .trim();

    // Try multiple matching strategies
    let translatedName = equipmentTranslations[normalizedType] ||
      equipmentTranslations[equipmentTypeStr.toLowerCase()] ||
      equipmentTranslations[equipmentTypeStr];

    // Prioritize explicit keyword detection before partial matching
    if (!translatedName) {
      if (normalizedType.includes('network') || normalizedType.includes('rj45') || normalizedType.includes('ethernet')) {
        translatedName = quantity > 1 ? 'prises RJ45' : 'prise RJ45';
      } else if (normalizedType.includes('tv') || normalizedType.includes('television')) {
        translatedName = quantity > 1 ? 'prises TV' : 'prise TV';
      } else if (normalizedType.includes('switch') || normalizedType.includes('interrupteur') || normalizedType.includes('commande')) {
        translatedName = quantity > 1 ? 'interrupteurs simples' : 'interrupteur simple';
      } else if (normalizedType.includes('lighting') || normalizedType.includes('light') || normalizedType.includes('luminaire') || normalizedType.includes('eclairage')) {
        translatedName = quantity > 1 ? 'points lumineux' : 'point lumineux';
      } else if (normalizedType.includes('radiator') || normalizedType.includes('radiateur')) {
        translatedName = quantity > 1 ? 'radiateurs' : 'radiateur';
      } else if (normalizedType.includes('convector') || normalizedType.includes('convecteur')) {
        translatedName = quantity > 1 ? 'convecteurs' : 'convecteur';
      } else if (normalizedType.includes('heating') || normalizedType.includes('chauffage')) {
        translatedName = quantity > 1 ? 'chauffages' : 'chauffage';
      } else if (normalizedType.includes('water_heater') || normalizedType.includes('chauffe_eau')) {
        translatedName = quantity > 1 ? 'chauffe-eaux' : 'chauffe-eau';
      } else if (normalizedType.includes('vmc') || normalizedType.includes('ventilation')) {
        translatedName = 'VMC';
      } else if (normalizedType.includes('socket') || normalizedType.includes('prise')) {
        translatedName = quantity > 1 ? 'prises simples' : 'prise simple';
      }
    }

    if (translatedName) {
      // Handle plural forms properly
      if (quantity > 1 && !translatedName.endsWith('s') && !translatedName.includes('VMC')) {
        // Add proper French plural
        if (translatedName.endsWith('eau')) {
          translatedName = translatedName + 'x'; // chauffe-eau -> chauffe-eaux
        } else if (translatedName.endsWith('u')) {
          translatedName = translatedName + 's'; // lumineux stays lumineux (already plural form)
        } else if (!translatedName.endsWith('s')) {
          translatedName = translatedName + 's';
        }
      }
      return quantity > 1 ? `${quantity} ${translatedName}` : `1 ${translatedName}`;
    }

    // If no translation found, return original
    return missingEquipmentType;
  };

  // Check if installation is globally compliant
  const isGloballyCompliant = complianceResult?.global_compliance?.overall_status === 'compliant';
  const currentSignature = JSON.stringify({
    rooms: rooms.map(r => ({ id: r.id, surface: r.surface, type: r.roomType })),
    equipments: projectData.equipments ?? []
  });

  const isResultStale = complianceResultSignature.current !== currentSignature;
  const hasComplianceIssues =
    !!complianceResult && !isGloballyCompliant && !isResultStale;

  // Check if there are actionable suggestions (missing equipment)
  const hasSuggestions = useMemo(() => {
    if (!hasComplianceIssues) return false;
    return hasComplianceSuggestions(complianceResult);
  }, [complianceResult, hasComplianceIssues]);

  // Apply compliance suggestions
  const applySuggestions = async () => {
    if (!complianceResult?.room_results || !projectData.id) return;

    setIsApplyingSuggestions(true);
    try {
      const { updatedEquipments, hasAddedEquipments } = applyComplianceSuggestions(
        complianceResult,
        projectData.equipments || [],
      );

      if (hasAddedEquipments) {
        // Update local state
        setProjectData({
          ...projectData,
          equipments: updatedEquipments,
        });

        // Save to backend
        const currentOptions = projectData.options || { type: 'Aucun' };
        const optionEquipments = optionsToEquipments(currentOptions, projectData.id.toString());
        const allBackendEquipments = [
          ...equipmentsToBackend(updatedEquipments),
          ...optionEquipments,
        ];

        await updateProjectEquipments.mutateAsync({
          data: {
            projectId: projectData.id.toString(),
            equipments: allBackendEquipments,
          },
        });

        // Déclencher une revalidation de la conformité après application des suggestions
        triggerComplianceValidation();
      }
    } catch (error) {
      console.error('Failed to apply suggestions:', error);
    } finally {
      setIsApplyingSuggestions(false);
    }
  };

  useEffect(() => {
    if (onComplianceStatusChange) {
      onComplianceStatusChange(isGloballyCompliant);
    }
  }, [isGloballyCompliant, onComplianceStatusChange]);

  return (
    <>
      {/* Compliance Verification Section */}
      <ComplianceVerificationSection
        complianceResult={complianceResult}
        isValidating={isValidating}
        complianceError={complianceError}
        hasSuggestions={hasSuggestions}
        isApplyingSuggestions={isApplyingSuggestions}
        applySuggestions={applySuggestions}
        validateCompliance={() => validateCompliance()}
        isEquipmentsModalOpen={isEquipmentsModalOpen}
        isResultStale={isResultStale}
        rooms={rooms.map(r => ({ id: r.id?.toString() || '', label: r.name || (r as any).options?.roomType || `Pièce ${r.id}` }))}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - 25% */}
        <div className="w-full lg:w-1/4 space-y-8">
          {/* Project Information */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-gray-500" />
                Informations du projet
              </h3>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nom</dt>
                  <dd className="mt-1 text-sm text-gray-900">{projectData.name || 'Non défini'}</dd>
                </div>
                {projectData.description && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{projectData.description}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type de projet</dt>
                  <dd className="mt-1 text-sm text-gray-900">{projectData.typeProjet || 'Non défini'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type de travaux</dt>
                  <dd className="mt-1 text-sm text-gray-900">{projectData.typeTravaux || 'Non défini'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Code postal</dt>
                  <dd className="mt-1 text-sm text-gray-900">{projectData.codePostal || 'Non défini'}</dd>
                </div>
                {projectData.numberOfPeople !== undefined && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nombre de personnes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{projectData.numberOfPeople}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Project Overview */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-gray-500" />
                Vue d'ensemble
              </h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Surface totale</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">{totalSurface.toFixed(2)} m²</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre d'équipements</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">{totalEquipments}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Plans */}
          <PlanViewer
            planFiles={projectData.planFiles || []}
            title="Plans du projet"
            maxHeight="none"
          />
        </div>

        {/* Right Column - 75% */}
        <div className="w-full lg:w-3/4 space-y-8">
          {/* Rooms and Equipment */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-gray-500" />
                Détail par pièce
              </h3>
              <button
                onClick={() => {
                  // Open the equipments modal without pre-selecting a specific room
                  setEditingRoomId(null);
                  setIsEquipmentsModalOpen(true);
                }}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Modifier
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {rooms.map((room: Room) => {
                const equipments = getEquipmentsByRoom(room.id?.toString() || '');
                const roomComplianceStatus = getRoomComplianceStatus(room.id?.toString() || '');
                const hasRoomIssues = roomComplianceStatus && roomComplianceStatus.compliance_status !== 'compliant';
                
                return (
                  <div key={room.id} className="px-6 py-4 group relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center min-w-0">
                        {hasRoomIssues && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                        )}
                        <span className="truncate">{room.name} ({room.surface.toFixed(2)} m²)</span>
                        {room.roomType && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                            {getRoomTypeByType(room.roomType)?.label || room.roomType}
                          </span>
                        )}
                      </h4>

                      {/* Per-room edit button */}
                      <button
                        onClick={() => {
                          setEditingRoomId(room.id?.toString() || '');
                          setIsEquipmentsModalOpen(true);
                        }}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transform transition-all duration-200 translate-y-1 group-hover:translate-y-0"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Modifier
                      </button>
                    </div>
                    
                    {/* Room compliance issues */}
                    {hasRoomIssues && roomComplianceStatus && (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm min-w-0">
                            <p className="font-medium text-yellow-800">Problèmes de conformité :</p>
                            {roomComplianceStatus.missing_equipment?.length > 0 && (
                              <p className="text-yellow-700 mt-1">
                                Équipements manquants : {roomComplianceStatus.missing_equipment.map(translateEquipmentType).join(', ')}
                              </p>
                            )}
                            {roomComplianceStatus.violations?.map((violation, index) => (
                              <p key={index} className="text-yellow-700 mt-1">{violation.message}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {equipments.length > 0 ? (
                      <ul className="space-y-1">
                        {equipments.map((eq: Equipment) => (
                          <li key={eq.id} className="text-sm text-gray-600 flex items-center min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0" />
                            <span className="truncate">{eq.quantity}x {eq.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Aucun équipement</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options */}
          {/* <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Settings2 className="w-5 h-5 mr-2 text-gray-500" />
                Options sélectionnées
              </h3>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Système domotique</dt>
                  <dd className="mt-1 text-sm text-gray-900">{projectData.options?.type}</dd>
                </div>
                {projectData.options?.accessControl && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contrôle d'accès</dt>
                    <dd className="mt-1 space-y-1">
                      {Object.entries(projectData.options.accessControl)
                        .filter(([key, value]) => typeof value === 'boolean' && value)
                        .map(([key]) => (
                          <div key={key} className="flex items-center text-sm text-gray-900">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </div>
                        ))}
                    </dd>
                  </div>
                )}
                {projectData.options?.ecs && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ECS</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <p>Type: {projectData.options.ecs.type}</p>
                      <p>Nombre de personnes: {projectData.options.ecs.nombrePersonnes}</p>
                      {projectData.options.ecs.nombrePiecesEau && (
                        <p>Nombre de pièces d'eau: {projectData.options.ecs.nombrePiecesEau}</p>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div> */}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-12">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Ce récapitulatif est généré automatiquement à partir de votre plan et de vos sélections.
              Veuillez vérifier attentivement toutes les informations avant de valider.
            </p>
          </div>
        </div>
      </div>

      {/* Equipments Edit Modal */}
      {isEquipmentsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={(e) => {
            // Close when the backdrop itself is clicked (ignore clicks inside the modal)
            if (e.target === e.currentTarget) {
              setIsEquipmentsModalOpen(false);
              setEditingRoomId(null);
              // Déclencher une revalidation de la norme après fermeture de la modale
              triggerComplianceValidation();
            }
          }}
        >
          <div className="relative bg-white rounded-lg w-[98vw] md:w-[95vw] lg:w-[95vw] xl:w-[85vw] max-w-none max-h-[95vh] overflow-y-auto p-8 shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => {
                setIsEquipmentsModalOpen(false);
                setEditingRoomId(null);
                // Déclencher une revalidation de la norme après fermeture de la modale
                triggerComplianceValidation();
              }}
            >
              <X className="w-6 h-6" />
            </button>
            <StepEquipments
              onNext={() => {}}
              onPrevious={() => {}}
              projectData={projectData}
              setProjectData={setProjectData}
              initialRoomId={editingRoomId || undefined}
            />
          </div>
        </div>
      )}
    </>
  );
}
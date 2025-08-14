import { useState, useEffect, useCallback } from 'react';
import { Zap, Shield, Droplet, Plus, Minus, Phone, Bell, Warehouse, Car, Sun, Flower as FlowerDaffodil, Settings2, Router, Wifi, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import type { Project, ProjectOptions } from '../types';
import { useProjectEquipments } from '@/features/shared/hooks/project-equipments/useProjectEquipments';
import { useDebouncedOptionsUpdate } from '@/features/shared/hooks/project-equipments/useDebouncedOptionsUpdate';
import { optionsToEquipments, equipmentsToOptions } from '@/features/shared/utils/optionsToEquipments';
import { useEquipmentsMerger } from '@/features/shared/hooks/project-equipments/useEquipmentsMerger';

interface StepOptionsProps {
  onNext: () => void;
  onPrevious: () => void;
  projectData: Partial<Project>;
  setProjectData: (data: Partial<Project>) => void;
}

const automationOptions = [
  {
    id: 'Aucun',
    name: 'Pas de domotique',
    disabled: false,
    icon: X,
    description: 'Installation électrique traditionnelle sans système domotique',
    features: [
      'Installation classique',
      'Pas de gestion de consommation',
      'Pas de scénario personnalisé'
    ]
  },
  {
    id: 'Wiser',
    name: 'Wiser',
    disabled: true,
    icon: Zap,
    description: 'Solution connectée simple et accessible pour la maison intelligente',
    imageUrl: 'https://i.ibb.co/kgphTy8s/unnamed.png',
    features: [
      'Installation rapide',
      'Application intuitive',
      'Prix compétitif',
      'Compatible Zigbee',
      'Contrôle via smartphone'
    ]
  }
];

function StepOptions({ onNext, onPrevious, projectData, setProjectData }: StepOptionsProps) {
  const projectId = (projectData as any)?.id;

  // Load existing equipments and options from backend
  const { data: projectEquipments, isLoading } = useProjectEquipments(projectId, {
    enabled: !!projectId && projectId !== 'new'
  });

  const updateEquipmentsMutation = useDebouncedOptionsUpdate();
  const { mergeOptionEquipments } = useEquipmentsMerger();

  const [accessControl, setAccessControl] = useState(projectData.options?.accessControl ?? {
    interphonie: false,
    alarme: false,
    portailEntree: {
      motorise: false,
      type: undefined,
    },
    portailGarage: false,
    irve: false,
    eclairageFacade: false,
  });

  const [ecs, setEcs] = useState(projectData.options?.ecs ?? {
    type: '',
    nombrePiecesEau: undefined,
    nombrePersonnes: 1,
  });

  // Load options from backend equipments when available
  useEffect(() => {
    if (projectEquipments?.equipments) {
      const options = equipmentsToOptions(projectEquipments.equipments);
      setAccessControl(options.accessControl || accessControl);
      setEcs(options.ecs || ecs);

      // Update local project data
      setProjectData({
        ...projectData,
        options: {
          ...projectData.options,
          ...options
        }
      });
    }
  }, [projectEquipments]);

  // Auto-save function with debouncing using use-debounce
  const autoSaveOptions = useDebouncedCallback((options: ProjectOptions) => {
    if (!projectId || projectId === 'new') return;

    // Use the merger hook to safely combine option equipments with existing room equipments
    const allEquipments = mergeOptionEquipments(options, projectId, projectEquipments?.equipments || []);

    updateEquipmentsMutation.debouncedMutate({
      data: {
        projectId,
        equipments: allEquipments
      }
    });
  }, 1000, { leading: false, trailing: true });

  const handleOptionSelect = (type: ProjectOptions['type']) => {
    const newOptions = {
      ...projectData.options,
      type,
      wiserConfig: type === 'Wiser'
        ? projectData.options?.wiserConfig || {
          controleur: 'TXA663A',
          modules: {
            variateur: 0,
            volets: 0,
            chauffage: 0,
            commande: 0
          },
          gateway: false,
          zigbee: false
        }
        : undefined,
      accessControl,
      ecs
    } as ProjectOptions;

    setProjectData({
      ...projectData,
      options: newOptions
    });

    // Auto-save to backend
    autoSaveOptions(newOptions);
  };

  const handleWiserConfigChange = (key: string, value: any) => {
    setProjectData({
      ...projectData,
      options: {
        ...projectData.options,
        wiserConfig: {
          ...projectData.options?.wiserConfig,
          [key]: value
        }
      }
    });
  };

  const handleWiserModuleChange = (moduleType: string, value: number) => {
    setProjectData({
      ...projectData,
      options: {
        ...projectData.options,
        wiserConfig: {
          ...projectData.options?.wiserConfig,
          modules: {
            ...projectData.options?.wiserConfig?.modules,
            [moduleType]: Math.max(0, value)
          }
        }
      }
    });
  };

  const handleAccessControlChange = (key: string, value: boolean | string) => {
    let newAccessControl = { ...accessControl };

    if (key === 'portailEntreeType') {
      newAccessControl.portailEntree = {
        ...newAccessControl.portailEntree,
        type: value as 'coulissant' | 'battant'
      };
    } else if (key === 'portailEntree') {
      newAccessControl.portailEntree = {
        motorise: value as boolean,
        type: value ? newAccessControl.portailEntree.type : undefined
      };
    } else {
      newAccessControl = {
        ...newAccessControl,
        [key]: value
      };
    }

    setAccessControl(newAccessControl);

    const newOptions = {
      ...projectData.options,
      accessControl: newAccessControl
    } as ProjectOptions;

    setProjectData({
      ...projectData,
      options: newOptions
    });

    // Auto-save to backend
    autoSaveOptions(newOptions);
  };

  return (
    <div className="space-y-8">
      {/* Domotique */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings2 className="w-5 h-5 mr-2" />
          Système de contrôle
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {automationOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = projectData.options?.type === option.id;

            return (
              <div
                key={option.id}
                onClick={() => {
                  if (!option.disabled) {
                    handleOptionSelect(option.id as ProjectOptions['type']);
                  }
                }}
                aria-disabled={option.disabled}
                className={`
                  relative rounded-lg p-6 transition-all overflow-hidden
                  ${option.disabled
                                  ? 'bg-gray-50 cursor-not-allowed opacity-60 pointer-events-none select-none'
                                  : 'cursor-pointer'
                                }
                  ${isSelected && !option.disabled
                                  ? 'bg-blue-50 border-2 border-blue-500 shadow-lg'
                                  : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md'
                                }
                `}
              >
                {option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt={option.name}
                    className="absolute top-2 right-2 w-16 h-16 object-contain rounded-lg"
                  />
                )}

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  </div>
                )}

                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {option.name}
                </h4>

                <p className="text-sm text-gray-600 mb-4">
                  {option.description}
                </p>

                <ul className="space-y-2">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wiser Configuration */}
      {projectData.options?.type === 'Wiser' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings2 className="w-5 h-5 mr-2 text-gray-500" />
              Configuration Wiser
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Contrôleur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de contrôleur
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => handleWiserConfigChange('controleur', 'TXA663A')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${projectData.options?.wiserConfig?.controleur === 'TXA663A'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center mb-2">
                    <Router className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-medium">TXA663A</h4>
                  </div>
                  <p className="text-sm text-gray-600">Contrôleur standard</p>
                </div>
                <div
                  onClick={() => handleWiserConfigChange('controleur', 'TXA663AN')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${projectData.options?.wiserConfig?.controleur === 'TXA663AN'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center mb-2">
                    <Router className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-medium">TXA663AN</h4>
                  </div>
                  <p className="text-sm text-gray-600">Contrôleur avec fonction IP</p>
                </div>
              </div>
            </div>

            {/* Modules */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Modules</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Variateurs</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleWiserModuleChange('variateur', (projectData.options?.wiserConfig?.modules?.variateur || 0) - 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {projectData.options?.wiserConfig?.modules?.variateur || 0}
                      </span>
                      <button
                        onClick={() => handleWiserModuleChange('variateur', (projectData.options?.wiserConfig?.modules?.variateur || 0) + 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Pour le contrôle de l'éclairage variable</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Volets roulants</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleWiserModuleChange('volets', (projectData.options?.wiserConfig?.modules?.volets || 0) - 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {projectData.options?.wiserConfig?.modules?.volets || 0}
                      </span>
                      <button
                        onClick={() => handleWiserModuleChange('volets', (projectData.options?.wiserConfig?.modules?.volets || 0) + 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Pour le contrôle des volets motorisés</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Chauffage</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleWiserModuleChange('chauffage', (projectData.options?.wiserConfig?.modules?.chauffage || 0) - 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {projectData.options?.wiserConfig?.modules?.chauffage || 0}
                      </span>
                      <button
                        onClick={() => handleWiserModuleChange('chauffage', (projectData.options?.wiserConfig?.modules?.chauffage || 0) + 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Pour le contrôle du chauffage électrique</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Commandes</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleWiserModuleChange('commande', (projectData.options?.wiserConfig?.modules?.commande || 0) - 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {projectData.options?.wiserConfig?.modules?.commande || 0}
                      </span>
                      <button
                        onClick={() => handleWiserModuleChange('commande', (projectData.options?.wiserConfig?.modules?.commande || 0) + 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Pour les points de commande sans fil</p>
                </div>
              </div>
            </div>

            {/* Options avancées */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Options avancées</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Router className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Passerelle IP</label>
                      <p className="text-xs text-gray-500">Pour le contrôle à distance</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={projectData.options?.wiserConfig?.gateway}
                      onChange={(e) => handleWiserConfigChange('gateway', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Wifi className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Support Zigbee</label>
                      <p className="text-xs text-gray-500">Pour les accessoires connectés</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={projectData.options?.wiserConfig?.zigbee}
                      onChange={(e) => handleWiserConfigChange('zigbee', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contrôle d'accès */}
      <div className="bg-gray-50 cursor-not-allowed opacity-60 pointer-events-none select-none rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Contrôle d'accès et sécurité
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Bientôt disponible
          </span>
        </h3>
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          {/* Interphonie */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-gray-500" />
              Interphonie
              <div className="relative group ml-2">
                <div className="cursor-help">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  Système de communication audio/vidéo pour contrôler l'accès à votre habitation
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={accessControl.interphonie}
                onChange={(e) => handleAccessControlChange('interphonie', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Alarme */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-gray-500" />
              Alarme
              <div className="relative group ml-2">
                <div className="cursor-help">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  Système de sécurité avec détecteurs de mouvement et sirène
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={accessControl.alarme}
                onChange={(e) => handleAccessControlChange('alarme', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Portail entrée */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FlowerDaffodil className="w-5 h-5 mr-2 text-gray-500" />
                Portail entrée motorisé
                <div className="relative group ml-2">
                  <div className="cursor-help">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    Motorisation du portail d'entrée avec télécommande et/ou contrôle via smartphone
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={accessControl.portailEntree.motorise}
                  onChange={(e) => handleAccessControlChange('portailEntree', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {accessControl.portailEntree.motorise && (
              <div className="flex items-center space-x-4 ml-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    name="portailType"
                    value="coulissant"
                    checked={accessControl.portailEntree.type === 'coulissant'}
                    onChange={(e) => handleAccessControlChange('portailEntreeType', e.target.value)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Coulissant</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    name="portailType"
                    value="battant"
                    checked={accessControl.portailEntree.type === 'battant'}
                    onChange={(e) => handleAccessControlChange('portailEntreeType', e.target.value)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Battant</span>
                </label>
              </div>
            )}
          </div>

          {/* Portail garage */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Warehouse className="w-5 h-5 mr-2 text-gray-500" />
              Portail garage motorisé
              <div className="relative group ml-2">
                <div className="cursor-help">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  Motorisation de la porte de garage avec télécommande et/ou contrôle via smartphone
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={accessControl.portailGarage}
                onChange={(e) => handleAccessControlChange('portailGarage', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* IRVE */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Car className="w-5 h-5 mr-2 text-gray-500" />
              IRVE (Infrastructure de Recharge de Véhicule Électrique)
              <div className="relative group ml-2">
                <div className="cursor-help">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  Borne de recharge pour véhicule électrique avec protection dédiée
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={accessControl.irve}
                onChange={(e) => handleAccessControlChange('irve', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Éclairage façade */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Sun className="w-5 h-5 mr-2 text-gray-500" />
              Éclairage façade
              <div className="relative group ml-2">
                <div className="cursor-help">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  Éclairage extérieur automatique avec détection de présence
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={accessControl.eclairageFacade}
                onChange={(e) => handleAccessControlChange('eclairageFacade', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}


export { StepOptions }
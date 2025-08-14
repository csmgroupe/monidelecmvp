import type { ProjectOptions } from '@/features/abplan/types';
import type { ProjectEquipmentDto } from '@/api/generated/ProjectEquipments';

export const optionsToEquipments = (options: ProjectOptions, projectId: string): ProjectEquipmentDto[] => {
  const equipments: ProjectEquipmentDto[] = [];

  // Système de contrôle
  if (options.type) {
    equipments.push({
      name: `Système ${options.type}`,
      quantity: 1,
      category: 'option',
      type: 'automation_system',
      metadata: {
        systemType: options.type,
        wiserConfig: options.wiserConfig
      }
    });
  }

  // Configuration Wiser
  if (options.wiserConfig) {
    const { modules, controleur, gateway, zigbee } = options.wiserConfig;
    
    if (modules) {
      Object.entries(modules).forEach(([moduleType, quantity]) => {
        if (quantity && quantity > 0) {
          equipments.push({
            name: `Module ${moduleType}`,
            quantity: quantity,
            category: 'option',
            type: 'wiser_module',
            metadata: {
              moduleType,
              controleur
            }
          });
        }
      });
    }

    if (gateway) {
      equipments.push({
        name: 'Gateway Wiser',
        quantity: 1,
        category: 'option',
        type: 'wiser_gateway',
        metadata: { controleur }
      });
    }

    if (zigbee) {
      equipments.push({
        name: 'Module Zigbee',
        quantity: 1,
        category: 'option',
        type: 'wiser_zigbee',
        metadata: { controleur }
      });
    }
  }

  // Contrôle d'accès
  if (options.accessControl) {
    const { interphonie, alarme, portailEntree, portailGarage, irve, eclairageFacade } = options.accessControl;

    if (interphonie) {
      equipments.push({
        name: 'Interphonie',
        quantity: 1,
        category: 'option',
        type: 'access_control',
        metadata: { accessType: 'interphonie' }
      });
    }

    if (alarme) {
      equipments.push({
        name: 'Système d\'alarme',
        quantity: 1,
        category: 'option',
        type: 'access_control',
        metadata: { accessType: 'alarme' }
      });
    }

    if (portailEntree.motorise) {
      equipments.push({
        name: `Portail entrée ${portailEntree.type || 'motorisé'}`,
        quantity: 1,
        category: 'option',
        type: 'access_control',
        metadata: { 
          accessType: 'portailEntree',
          portailType: portailEntree.type
        }
      });
    }

    if (portailGarage) {
      equipments.push({
        name: 'Portail garage motorisé',
        quantity: 1,
        category: 'option',
        type: 'access_control',
        metadata: { accessType: 'portailGarage' }
      });
    }

    if (irve) {
      equipments.push({
        name: 'IRVE (Borne véhicule électrique)',
        quantity: 1,
        category: 'option',
        type: 'access_control',
        metadata: { accessType: 'irve' }
      });
    }

    if (eclairageFacade) {
      equipments.push({
        name: 'Éclairage façade',
        quantity: 1,
        category: 'option',
        type: 'access_control',
        metadata: { accessType: 'eclairageFacade' }
      });
    }
  }

  // ECS
  if (options.ecs && options.ecs.type) {
    equipments.push({
      name: `Chauffe-eau ${options.ecs.type}`,
      quantity: 1,
      category: 'option',
      type: 'ecs',
      metadata: {
        ecsType: options.ecs.type,
        nombrePersonnes: options.ecs.nombrePersonnes,
        nombrePiecesEau: options.ecs.nombrePiecesEau
      }
    });
  }

  return equipments;
};

export const equipmentsToOptions = (equipments: ProjectEquipmentDto[]): ProjectOptions => {
  const options: ProjectOptions = {
    type: 'Aucun',
    accessControl: {
      interphonie: false,
      alarme: false,
      portailEntree: { motorise: false },
      portailGarage: false,
      irve: false,
      eclairageFacade: false,
    },
    ecs: {
      type: '',
      nombrePersonnes: 1,
    }
  };

  const optionEquipments = equipments.filter(eq => eq.category === 'option');

  // Reconstituer les options à partir des équipements
  optionEquipments.forEach(equipment => {
    const { type, metadata } = equipment;

    switch (type) {
      case 'automation_system':
        options.type = metadata?.systemType || 'Aucun';
        if (metadata?.wiserConfig) {
          options.wiserConfig = metadata.wiserConfig;
        }
        break;

      case 'wiser_module':
        if (!options.wiserConfig) {
          options.wiserConfig = {
            controleur: 'TXA663A',
            modules: {},
            gateway: false,
            zigbee: false
          };
        }
        if (!options.wiserConfig.modules) {
          options.wiserConfig.modules = {};
        }
        const moduleType = metadata?.moduleType;
        if (moduleType && options.wiserConfig.modules) {
          (options.wiserConfig.modules as any)[moduleType] = equipment.quantity;
        }
        break;

      case 'wiser_gateway':
        if (!options.wiserConfig) {
          options.wiserConfig = {
            controleur: 'TXA663A',
            modules: {},
            gateway: false,
            zigbee: false
          };
        }
        options.wiserConfig.gateway = true;
        break;

      case 'wiser_zigbee':
        if (!options.wiserConfig) {
          options.wiserConfig = {
            controleur: 'TXA663A',
            modules: {},
            gateway: false,
            zigbee: false
          };
        }
        options.wiserConfig.zigbee = true;
        break;

      case 'access_control':
        const accessType = metadata?.accessType;
        if (accessType && options.accessControl) {
          switch (accessType) {
            case 'interphonie':
              options.accessControl.interphonie = true;
              break;
            case 'alarme':
              options.accessControl.alarme = true;
              break;
            case 'portailEntree':
              options.accessControl.portailEntree = {
                motorise: true,
                type: metadata?.portailType
              };
              break;
            case 'portailGarage':
              options.accessControl.portailGarage = true;
              break;
            case 'irve':
              options.accessControl.irve = true;
              break;
            case 'eclairageFacade':
              options.accessControl.eclairageFacade = true;
              break;
          }
        }
        break;

      case 'ecs':
        if (options.ecs) {
          options.ecs.type = metadata?.ecsType || '';
          options.ecs.nombrePersonnes = metadata?.nombrePersonnes || 1;
          options.ecs.nombrePiecesEau = metadata?.nombrePiecesEau;
        }
        break;
    }
  });

  return options;
}; 
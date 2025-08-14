export interface ElectricalEquipmentItem {
  type: 'prise_standard' | 'prise_specialisee' | 'prise_communication' | 'prise_etanche' | 
        'eclairage_principal' | 'eclairage_secondaire' | 'interrupteur_simple' | 'interrupteur_va_et_vient';
  quantity: number;
  description: string;
}

export interface Room {
  id: number;
  name: string;
  surface: number;
  roomType?: string; // Type de pièce (Kitchen, Bedroom, etc.)
  exposition?: 'Nord' | 'Sud' | 'Est' | 'Ouest';
  options?: {
    nfc15100Compliant?: boolean;
    [key: string]: any;
  };
}

export interface Equipment {
  id: string;
  name: string;
  quantity: number;
  roomId: string;
  type?: string;
  metadata?: Record<string, any>;
}

export interface ProjectOptions {
  type: 'Wiser' | 'Autre' | 'Aucun';
  wiserConfig?: {
    controleur: 'TXA663A' | 'TXA663AN';
    modules: {
      variateur?: number;
      volets?: number;
      chauffage?: number;
      commande?: number;
    };
    gateway?: boolean;
    zigbee?: boolean;
  };
  accessControl?: {
    interphonie: boolean;
    alarme: boolean;
    portailEntree: {
      motorise: boolean;
      type?: 'coulissant' | 'battant';
    };
    portailGarage: boolean;
    irve: boolean;
    eclairageFacade: boolean;
  };
  ecs?: {
    type: 'electrique' | 'thermodynamique-individuel' | 'thermodynamique-pac' | '';
    nombrePiecesEau?: number;
    nombrePersonnes: number;
  };
}

export interface Project {
  id?: string;
  name: string;
  description?: string;
  typeProjet?: 'Résidentiel' | 'Tertiaire';
  typeTravaux?: 'Construction' | 'Renovation';
  codePostal?: string;
  pieces?: Room[];
  equipments: Equipment[];
  options: ProjectOptions;
  status: 'draft' | 'analyzing' | 'ready' | 'completed';
  planUrl?: string;
  surface_loi_carrez?: number;
  numberOfPeople?: number;
}
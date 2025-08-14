import type { Project as WizardProject, Room, Equipment } from '../../types';
import type { Project, PlanFile } from '@/modules/abplan/projects/domain/project.entity';

// Type hybride pour le wizard qui combine les deux types
export type ProjectWithWizardData = Partial<Project & WizardProject & {
  rooms?: Room[];
  pieces?: Room[];
  planFiles?: PlanFile[];
  dimensioning?: {
    circuit_breakers?: Array<{ description: string; rating: number; quantity: number; }>;
    electrical_panels?: Array<{ type: string; modules: number; }>;
    cables?: Array<{ type: string; section: number; length_estimate: number; }>;
    surge_protectors?: Array<{ type: string; rating: string; quantity: number; description: string; }>;
  };
  quoteItems?: QuoteItem[];
  dimensioningItems?: DimensioningQuoteItem[];
  totalAmount?: number;
  lastQuoteUpdate?: string;
}>;

export interface QuoteItem {
  id: string;
  intitule: string;
  reference_principal: string;
  prix: number;
  plaque_blanche: string;
  plaque_noir: string;
  boite_encastrement: string;
  section_cable: string;
  reference_cable: string;
  prix_au: string;
  quantity: number;
  roomId?: string;
  equipmentType?: string;
  category?: 'equipment' | 'dimensioning';
}

export interface DimensioningQuoteItem {
  id: string;
  intitule: string;
  reference_principal: string;
  prix: number;
  quantity: number;
  description?: string;
  rating?: string | number;
  modules?: number;
  section?: number;
  length_estimate?: number;
  type: 'circuit_breaker' | 'electrical_panel' | 'cable' | 'surge_protector' | 'differential_circuit_breaker';
  rowId?: string; // For grouping circuit breakers by rows
  circuitBreakerIds?: string[]; // For DDR: list of circuit breaker IDs in this row
}

export interface QuoteItemsByRoom {
  grouped: { [roomId: string]: QuoteItem[] };
  customItems: QuoteItem[];
} 
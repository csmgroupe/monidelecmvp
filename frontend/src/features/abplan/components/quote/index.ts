export { QuoteHeader } from './QuoteHeader';
export { QuoteFooter } from './QuoteFooter';
export { EquipmentByRoomTable } from './EquipmentByRoomTable';
export { CustomItemsTable } from './CustomItemsTable';
export { CircuitBreakersTable } from './CircuitBreakersTable';
export { ElectricalPanelsTable } from './ElectricalPanelsTable';
export { CablesTable } from './CablesTable';
export { SurgeProtectorsTable } from './SurgeProtectorsTable';
export { DimensioningSection } from './DimensioningSection';
export { ReferenceSelect } from './ReferenceSelect';
export { PlateSelect } from './PlateSelect';
export { EquipmentTypeSelect } from './EquipmentTypeSelect';
export { CircuitBreakerSelect } from './CircuitBreakerSelect';
export { ElectricalPanelSelect } from './ElectricalPanelSelect';
export { CableSelect } from './CableSelect';
export { ConfirmRecalculateModal } from './ConfirmRecalculateModal';

export type {
  ProjectWithWizardData,
  QuoteItem,
  DimensioningQuoteItem,
  QuoteItemsByRoom,
} from './types';

export type { ReferenceOption } from './reference-configs';

export {
  getEquipmentDisplayName,
  getRoomName,
  generateQuoteItems,
  generatePlateItems,
  generateDimensioningItems,
  createNewQuoteItem,
  calculateTotal,
  groupItemsByRoom,
  generateDDRItems,
  updateDimensioningItemsWithDDR,
} from './utils';

export {
  getReferencesByType,
  getReferenceDetails,
  EQUIPMENT_REFERENCES,
  WHITE_PLATE_REFERENCES,
  BLACK_PLATE_REFERENCES,
  ENCLOSURE_BOX_REFERENCES,
  CIRCUIT_BREAKER_REFERENCES,
  ELECTRICAL_PANEL_REFERENCES,
  CABLE_REFERENCES,
  SURGE_PROTECTOR_REFERENCES,
} from './reference-configs'; 
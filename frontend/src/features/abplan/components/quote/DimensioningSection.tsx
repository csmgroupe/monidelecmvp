import type { DimensioningQuoteItem } from './types';
import { CircuitBreakersTable } from './CircuitBreakersTable';
import { ElectricalPanelsTable } from './ElectricalPanelsTable';
import { CablesTable } from './CablesTable';
import { SurgeProtectorsTable } from './SurgeProtectorsTable';

interface DimensioningSectionProps {
  dimensioningItems: DimensioningQuoteItem[];
  editingDimensioningItem: string | null;
  onEditDimensioningItem: (id: string) => void;
  onUpdateDimensioningItem: (id: string, updates: Partial<DimensioningQuoteItem>) => void;
  onDeleteDimensioningItem: (id: string) => void;
  onSaveDimensioningItem: () => void;
  onCancelDimensioningEdit: () => void;
  onAddDimensioningItem: (type: 'circuit_breaker' | 'electrical_panel' | 'cable' | 'surge_protector' | 'differential_circuit_breaker') => void;
  onRecalculateDDR: () => void;
}

export function DimensioningSection({
  dimensioningItems,
  editingDimensioningItem,
  onEditDimensioningItem,
  onUpdateDimensioningItem,
  onDeleteDimensioningItem,
  onSaveDimensioningItem,
  onCancelDimensioningEdit,
  onAddDimensioningItem,
  onRecalculateDDR,
}: DimensioningSectionProps) {
  if (dimensioningItems.length === 0) return null;

  return (
    <>
      <CircuitBreakersTable
        items={dimensioningItems}
        editingItemId={editingDimensioningItem}
        onEditItem={onEditDimensioningItem}
        onUpdateItem={onUpdateDimensioningItem}
        onDeleteItem={onDeleteDimensioningItem}
        onSaveItem={onSaveDimensioningItem}
        onCancelEdit={onCancelDimensioningEdit}
        onAddItem={() => onAddDimensioningItem('circuit_breaker')}
        onRecalculateDDR={onRecalculateDDR}
      />
      
      <ElectricalPanelsTable
        items={dimensioningItems}
        editingItemId={editingDimensioningItem}
        onEditItem={onEditDimensioningItem}
        onUpdateItem={onUpdateDimensioningItem}
        onDeleteItem={onDeleteDimensioningItem}
        onSaveItem={onSaveDimensioningItem}
        onCancelEdit={onCancelDimensioningEdit}
        onAddItem={() => onAddDimensioningItem('electrical_panel')}
      />
      
      <CablesTable
        items={dimensioningItems}
        editingItemId={editingDimensioningItem}
        onEditItem={onEditDimensioningItem}
        onUpdateItem={onUpdateDimensioningItem}
        onDeleteItem={onDeleteDimensioningItem}
        onSaveItem={onSaveDimensioningItem}
        onCancelEdit={onCancelDimensioningEdit}
        onAddItem={() => onAddDimensioningItem('cable')}
      />
      
      <SurgeProtectorsTable
        items={dimensioningItems}
        editingItemId={editingDimensioningItem}
        onEditItem={onEditDimensioningItem}
        onUpdateItem={onUpdateDimensioningItem}
        onDeleteItem={onDeleteDimensioningItem}
        onSaveItem={onSaveDimensioningItem}
        onCancelEdit={onCancelDimensioningEdit}
        onAddItem={() => onAddDimensioningItem('surge_protector')}
      />
    </>
  );
} 
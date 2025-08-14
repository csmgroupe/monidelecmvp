import { EQUIPMENT_REFERENCES, getReferencesByType } from './reference-configs';

interface EquipmentTypeSelectProps {
  value: string;
  onChange: (equipmentType: string, defaultReference: string) => void;
  className?: string;
}

export function EquipmentTypeSelect({
  value,
  onChange,
  className = ''
}: EquipmentTypeSelectProps) {
  const equipmentTypes = Object.keys(EQUIPMENT_REFERENCES);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    const references = getReferencesByType('equipment', selectedType);
    const defaultReference = references.length > 0 ? references[0].value : '';
    
    onChange(selectedType, defaultReference);
  };

  const getDisplayName = (equipmentType: string): string => {
    const displayNames: Record<string, string> = {
      'SimpleSocket': 'Prise simple',
      'DoubleSocket': 'Prise double', 
      'NetworkSocket': 'Prise RJ45',
      'TVSocket': 'Prise TV',
      'OvenSocket': 'Prise Plaque',
      'ExtractorSocket': 'Prise Hotte',
      'SimpleSwitch': 'Interrupteur simple',
      'DoubleSwitch': 'Interrupteur double',
      'DimmerSwitch': 'Va-et-vient'
    };
    return displayNames[equipmentType] || equipmentType;
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
      <option value="">Sélectionner un type d'équipement</option>
      {equipmentTypes.map((type) => (
        <option key={type} value={type}>
          {getDisplayName(type)}
        </option>
      ))}
    </select>
  );
} 
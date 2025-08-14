import { WHITE_PLATE_REFERENCES, BLACK_PLATE_REFERENCES, type ReferenceOption } from './reference-configs';

interface PlateSelectProps {
  whitePlateValue: string;
  blackPlateValue: string;
  onChange: (whitePlate: string, blackPlate: string) => void;
  subType?: string;
  className?: string;
}

interface PlateOption extends ReferenceOption {
  color: 'white' | 'black';
  colorLabel: string;
}

export function PlateSelect({
  whitePlateValue,
  blackPlateValue,
  onChange,
  subType = 'simple',
  className = ''
}: PlateSelectProps) {
  // Combiner les références blanches et noires
  const whiteReferences = WHITE_PLATE_REFERENCES[subType] || [];
  const blackReferences = BLACK_PLATE_REFERENCES[subType] || [];
  
  const allPlateOptions: PlateOption[] = [
    ...whiteReferences.map(ref => ({
      ...ref,
      color: 'white' as const,
      colorLabel: 'blanche',
      label: `${ref.label.replace(' - Plaque', '')} - blanche`
    })),
    ...blackReferences.map(ref => ({
      ...ref,
      color: 'black' as const,
      colorLabel: 'noire',
      label: `${ref.label.replace(' - Plaque', '')} - noire`
    }))
  ];

  // Déterminer la valeur courante pour le select
  const getCurrentValue = (): string => {
    if (whitePlateValue && whitePlateValue.trim() !== '') {
      return `white:${whitePlateValue}`;
    }
    if (blackPlateValue && blackPlateValue.trim() !== '') {
      return `black:${blackPlateValue}`;
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === '') {
      onChange('', '');
      return;
    }

    const [color, value] = selectedValue.split(':');
    if (color === 'white') {
      onChange(value, '');
    } else if (color === 'black') {
      onChange('', value);
    }
  };

  if (allPlateOptions.length === 0) {
    return (
      <input
        type="text"
        value={whitePlateValue || blackPlateValue}
        onChange={(e) => onChange(e.target.value, '')}
        className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        placeholder="Sélectionner plaque"
      />
    );
  }

  return (
    <select
      value={getCurrentValue()}
      onChange={handleChange}
      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
      <option value="">Aucune plaque</option>
      {allPlateOptions.map((plate) => (
        <option 
          key={`${plate.color}-${plate.value}`} 
          value={`${plate.color}:${plate.value}`}
        >
          {plate.value} - {plate.colorLabel}
          {plate.price && ` - ${plate.price.toFixed(2)} €`}
        </option>
      ))}
    </select>
  );
} 
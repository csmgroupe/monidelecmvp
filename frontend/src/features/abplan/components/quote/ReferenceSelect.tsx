import { getReferencesByType, getReferenceDetails, getEnclosureBoxFromEquipment } from './reference-configs';

interface ReferenceSelectProps {
  value: string;
  onChange: (value: string, price?: number) => void;
  referenceType: string;
  subType?: string;
  className?: string;
  placeholder?: string;
  onPriceUpdate?: (price: number) => void;
  onEnclosureBoxUpdate?: (reference: string, price: number) => void;
}

export function ReferenceSelect({
  value,
  onChange,
  referenceType,
  subType,
  className = '',
  placeholder = 'Sélectionner une référence',
  onPriceUpdate,
  onEnclosureBoxUpdate
}: ReferenceSelectProps) {
  const references = getReferencesByType(referenceType, subType);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedReference = references.find(ref => ref.value === selectedValue);
    
    onChange(selectedValue, selectedReference?.price);
    
    if (onPriceUpdate && selectedReference?.price) {
      onPriceUpdate(selectedReference.price);
    }

    if (referenceType === 'equipment' && onEnclosureBoxUpdate && selectedReference) {
      const enclosureBox = getEnclosureBoxFromEquipment(selectedValue, subType || '');
      if (enclosureBox) {
        onEnclosureBoxUpdate(enclosureBox.reference, enclosureBox.price);
      }
    }
  };

  if (references.length === 0) {
    // Fallback vers un input simple si aucune référence n'est disponible
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
      <option value="">{placeholder}</option>
      {references.map((reference) => (
        <option key={reference.value} value={reference.value}>
          {reference.label}
          {reference.price && ` - ${reference.price.toFixed(2)} €`}
        </option>
      ))}
    </select>
  );
} 
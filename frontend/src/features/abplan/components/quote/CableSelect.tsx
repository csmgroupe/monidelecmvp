import { CABLE_REFERENCES } from './reference-configs';

interface CableSelectProps {
  value: string;
  onChange: (value: string, price?: number, section?: string) => void;
  className?: string;
  placeholder?: string;
}

export function CableSelect({
  value,
  onChange,
  className = '',
  placeholder = 'Sélectionner un câble'
}: CableSelectProps) {
  // Récupérer toutes les références de câbles
  const allCables = Object.entries(CABLE_REFERENCES).flatMap(([key, cables]) => 
    cables.map(cable => ({
      ...cable,
      key,
      section: extractSectionFromKey(key)
    }))
  );

  // Fonction pour extraire la section de la clé
  function extractSectionFromKey(key: string): string {
    if (key === 'rj45') return 'RJ45';
    if (key === 'coaxial') return 'Coaxial';
    
    // Pour les nouvelles clés comme 'r2v_1.5mm', 'prefile_2.5mm'
    if (key.includes('_')) {
      const parts = key.split('_');
      if (parts.length === 2) {
        return parts[1].replace('mm', '');
      }
    }
    
    // Fallback pour les anciennes clés
    return key.replace('mm', '');
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedCable = allCables.find(cable => cable.value === selectedValue);
    
    if (selectedCable) {
      onChange(selectedValue, selectedCable.price, selectedCable.section);
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
      <option value="">{placeholder}</option>
      {allCables.map((cable) => (
        <option key={cable.value} value={cable.value}>
          {cable.label}
          {cable.price && ` - ${cable.price.toFixed(2)} €`}
        </option>
      ))}
    </select>
  );
} 
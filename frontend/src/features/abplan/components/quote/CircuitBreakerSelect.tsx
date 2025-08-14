import { CIRCUIT_BREAKER_REFERENCES } from './reference-configs';

interface CircuitBreakerSelectProps {
  value: string;
  onChange: (value: string, price?: number, rating?: number) => void;
  className?: string;
  placeholder?: string;
}

export function CircuitBreakerSelect({
  value,
  onChange,
  className = '',
  placeholder = 'Sélectionner un disjoncteur'
}: CircuitBreakerSelectProps) {
  // Récupérer toutes les références de disjoncteurs
  const allBreakers = Object.entries(CIRCUIT_BREAKER_REFERENCES).flatMap(([key, breakers]) => 
    breakers.map(breaker => ({
      ...breaker,
      key,
      rating: key === '40A_2P' ? 40 : key === '63A_2P' ? 63 : parseInt(key.replace('A', ''))
    }))
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedBreaker = allBreakers.find(breaker => breaker.value === selectedValue);
    
    if (selectedBreaker) {
      onChange(selectedValue, selectedBreaker.price, selectedBreaker.rating);
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
      {allBreakers.map((breaker) => (
        <option key={breaker.value} value={breaker.value}>
          {breaker.label}
          {breaker.price && ` - ${breaker.price.toFixed(2)} €`}
        </option>
      ))}
    </select>
  );
} 
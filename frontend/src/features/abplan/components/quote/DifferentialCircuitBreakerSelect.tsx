import { DIFFERENTIAL_CIRCUIT_BREAKER_REFERENCES } from './reference-configs';

interface DifferentialCircuitBreakerSelectProps {
  value: string;
  onChange: (value: string, price?: number, rating?: number) => void;
  className?: string;
  placeholder?: string;
}

export function DifferentialCircuitBreakerSelect({
  value,
  onChange,
  className = '',
  placeholder = 'Sélectionner un DDR'
}: DifferentialCircuitBreakerSelectProps) {
  // Récupérer toutes les références de disjoncteurs différentiels
  const allBreakers = Object.entries(DIFFERENTIAL_CIRCUIT_BREAKER_REFERENCES).flatMap(([key, breakers]) => 
    breakers.map(breaker => ({
      ...breaker,
      key,
      rating: parseInt(key.replace('A', ''))
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
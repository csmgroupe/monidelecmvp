import { ELECTRICAL_PANEL_REFERENCES } from './reference-configs';

interface ElectricalPanelSelectProps {
  value: string;
  onChange: (value: string, price?: number, modules?: number) => void;
  className?: string;
  placeholder?: string;
}

export function ElectricalPanelSelect({
  value,
  onChange,
  className = '',
  placeholder = 'Sélectionner un tableau électrique'
}: ElectricalPanelSelectProps) {
  // Récupérer toutes les références de tableaux électriques
  const allPanels = Object.entries(ELECTRICAL_PANEL_REFERENCES).flatMap(([key, panels]) => 
    panels.map(panel => ({
      ...panel,
      key,
      modules: extractModulesFromDescription(panel.description || '')
    }))
  );

  // Fonction pour extraire le nombre total de modules de la description
  function extractModulesFromDescription(description: string): number {
    // Extraire le nombre de rangées (par défaut 1 s'il n'est pas précisé)
    const rowsMatch = description.match(/(\d+)\s*rang(?:ée|ées)/i);
    const rows = rowsMatch ? parseInt(rowsMatch[1], 10) : 1;

    // Extraire le nombre de modules par rangée
    const modulesMatch = description.match(/(\d+)\s*modules?/i);
    const modulesPerRow = modulesMatch ? parseInt(modulesMatch[1], 10) : 0;

    if (modulesPerRow === 0) return 0;
    return rows * modulesPerRow;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedPanel = allPanels.find(panel => panel.value === selectedValue);
    
    if (selectedPanel) {
      onChange(selectedValue, selectedPanel.price, selectedPanel.modules);
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
      {allPanels.map((panel) => (
        <option key={panel.value} value={panel.value}>
          {panel.label}
          {panel.price && ` - ${panel.price.toFixed(2)} €`}
        </option>
      ))}
    </select>
  );
} 
import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Calculator } from 'lucide-react';

const ISOLATION_COEFFICIENTS = {
  '2012+': 0.4,
  '2007-2012': 0.75,
  '2001-2006': 0.8,
  '1990-2000': 0.95,
  '1983-1989': 1.15,
  '1974-1982': 1.4,
  'pre-1974': 1.8,
};

interface TemperatureData {
  [key: string]: number;
}

const REGIONAL_TEMPERATURES: TemperatureData = {
  '01': -10,
  '02': -9,
  '03': -10,
  '04': -8,
  '05': -10,
  '06': -4,
  '07': -8,
  '08': -12,
  '09': -5,
  '10': -10,
  '11': -5,
  '12': -8,
  '13': -5,
  '14': -7,
  '15': -10,
  '16': -5,
  '17': -5,
  '18': -7,
  '19': -8,
  '21': -10,
  '22': -5,
  '23': -8,
  '24': -5,
  '25': -12,
  '26': -8,
  '27': -7,
  '28': -7,
  '29': -4,
  '2A': 0,
  '2B': 0,
  '30': -5,
  '31': -5,
  '32': -5,
  '33': -5,
  '34': -5,
  '35': -5,
  '36': -7,
  '37': -7,
  '38': -10,
  '39': -12,
  '40': -5,
  '41': -7,
  '42': -10,
  '43': -10,
  '44': -5,
  '45': -7,
  '46': -5,
  '47': -5,
  '48': -10,
  '49': -5,
  '50': -7,
  '51': -10,
  '52': -12,
  '53': -5,
  '54': -12,
  '55': -12,
  '56': -4,
  '57': -12,
  '58': -10,
  '59': -9,
  '60': -9,
  '61': -7,
  '62': -9,
  '63': -10,
  '64': -5,
  '65': -5,
  '66': -5,
  '67': -15,
  '68': -15,
  '69': -10,
  '70': -12,
  '71': -10,
  '72': -7,
  '73': -10,
  '74': -10,
  '75': -7,
  '76': -7,
  '77': -7,
  '78': -7,
  '79': -5,
  '80': -9,
  '81': -5,
  '82': -5,
  '83': -4,
  '84': -5,
  '85': -5,
  '86': -5,
  '87': -8,
  '88': -12,
  '89': -10,
  '90': -12,
  '91': -7,
  '92': -7,
  '93': -7,
  '94': -7,
  '95': -7,
};

export const HeatPumpCalculator = () => {
  const [surface, setSurface] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [constructionPeriod, setConstructionPeriod] = useState<keyof typeof ISOLATION_COEFFICIENTS>('1990-2000');
  const [ceilingHeight, setCeilingHeight] = useState<string>('2.5');
  const [result, setResult] = useState<{ min: number; max: number } | null>(null);
  const [error, setError] = useState<string>('');

  const calculatePower = () => {
    setError('');
    
    if (!surface || !postalCode || !constructionPeriod || !ceilingHeight) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const surfaceNum = parseFloat(surface);
    const heightNum = parseFloat(ceilingHeight);
    const department = postalCode.substring(0, 2);

    if (!REGIONAL_TEMPERATURES[department]) {
      setError('Code postal invalide');
      return;
    }

    const volume = surfaceNum * heightNum;
    const G = ISOLATION_COEFFICIENTS[constructionPeriod];
    const minTemp = REGIONAL_TEMPERATURES[department];
    const targetTemp = 19;
    const DT = targetTemp - minTemp;

    const P = G * volume * DT;
    const minPower = (P * 0.8) / 1000; // Convert to kW, 80% des déperditions
    const maxPower = (P * 1.2) / 1000; // Convert to kW, 120% avec appoint électrique

    setResult({
      min: Math.round(minPower * 10) / 10,
      max: Math.round(maxPower * 10) / 10
    });
  };

  return (
    <>
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calculator className="w-6 h-6 mr-2" />
              Calculateur de dimensionnement PAC
            </h1>
            <p className="mt-2 text-gray-600">
              Estimez la puissance nécessaire pour votre pompe à chaleur en fonction des caractéristiques de votre logement.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Surface */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surface habitable (m²)
                </label>
                <input
                  type="number"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="140"
                />
              </div>

              {/* Code postal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.slice(0, 5))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="75001"
                  maxLength={5}
                />
              </div>

              {/* Période de construction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Année de construction
                </label>
                <select
                  value={constructionPeriod}
                  onChange={(e) => setConstructionPeriod(e.target.value as keyof typeof ISOLATION_COEFFICIENTS)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="2012+">2012 et plus récent (RT2012/BBC)</option>
                  <option value="2007-2012">2007-2012 (RT2005)</option>
                  <option value="2001-2006">2001-2006 (RT2000)</option>
                  <option value="1990-2000">1990-2000</option>
                  <option value="1983-1989">1983-1989</option>
                  <option value="1974-1982">1974-1982</option>
                  <option value="pre-1974">Avant 1974 (non isolé)</option>
                </select>
              </div>

              {/* Hauteur sous plafond */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hauteur sous plafond (m)
                </label>
                <input
                  type="number"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="2.5"
                  step="0.1"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                onClick={calculatePower}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Calculer
              </button>

              {result && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    Puissance recommandée
                  </h3>
                  <p className="text-green-700">
                    <span className="font-bold">{result.min} kW</span> minimum (80% des déperditions)<br />
                    <span className="font-bold">{result.max} kW</span> avec appoint électrique (120% des déperditions)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Ce calcul est donné à titre indicatif. Pour un dimensionnement précis, faites appel à un professionnel qualifié.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

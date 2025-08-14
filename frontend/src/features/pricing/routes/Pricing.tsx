import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { authSelectors } from '@/modules/auth/application/auth.selectors';

const PLANS = {
  STARTER: {
    name: 'Starter',
    price: 49,
    annualPrice: 39,
    projectsPerMonth: 10,
    features: [
      'Analyse des plans ≤ 100 m²',
      'Support email (48h)',
      'Mises à jour gratuites'
    ]
  },
  PRO: {
    name: 'Pro',
    price: 129,
    annualPrice: 103,
    projectsPerMonth: 30,
    features: [
      'Toutes les fonctionnalités Starter',
      'Surface illimitée',
      'Support prioritaire (24h)',
      '3 utilisateurs inclus'
    ]
  },
  EXPERT: {
    name: 'Expert',
    price: 249,
    annualPrice: 199,
    projectsPerMonth: 100,
    features: [
      'Toutes les fonctionnalités Pro',
      'Support dédié (4h)',
      'Formation sur site annuelle',
      '10 utilisateurs inclus'
    ]
  }
};

interface PricingTierProps {
  name: string;
  price: number;
  annualPrice?: number;
  projectsPerMonth: number;
  features: string[];
  isPopular?: boolean;
}

const PricingTier = ({
  name,
  price,
  annualPrice,
  projectsPerMonth,
  features,
  isPopular = false
}: PricingTierProps) => (
  <div className={`p-8 bg-white rounded-xl shadow-lg relative ${isPopular ? 'border-2 border-blue-500 ring-4 ring-blue-500/10' : ''}`}>
    {isPopular && (
      <span className="absolute -top-4 right-4 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-full">
        Populaire
      </span>
    )}
    <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
    <div className="mb-6">
      <span className="text-5xl font-bold text-gray-900">{annualPrice || price}€</span>
      <span className="text-gray-600">/mois</span>
      {annualPrice && (
        <div className="text-sm text-green-600 font-medium mt-2">
          Économisez {((price - annualPrice) * 12)}€/an
        </div>
      )}
    </div>
    <div className="text-blue-500 font-semibold mb-6">
      {projectsPerMonth} projets/mois
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
          <span className="text-gray-600">{feature}</span>
        </li>
      ))}
    </ul>
    <a
      href="mailto:contact@ab-concept.fr"
      className={`block text-center w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
        isPopular
          ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-blue-500/25'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      Nous contacter
    </a>
  </div>
);

export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const user = useSelector(authSelectors.getUser);
  const navigate = useNavigate();

  return (
    <>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choisissez votre plan
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Sélectionnez l'offre qui correspond le mieux à vos besoins
            </p>
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-blue-600' : 'text-gray-500'}`}>
                Mensuel
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isAnnual ? 'text-blue-600' : 'text-gray-500'}`}>
                Annuel (-20%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingTier
              name={PLANS.STARTER.name}
              price={PLANS.STARTER.price}
              annualPrice={isAnnual ? PLANS.STARTER.annualPrice : undefined}
              projectsPerMonth={PLANS.STARTER.projectsPerMonth}
              features={PLANS.STARTER.features}
            />
            <PricingTier
              name={PLANS.PRO.name}
              price={PLANS.PRO.price}
              annualPrice={isAnnual ? PLANS.PRO.annualPrice : undefined}
              projectsPerMonth={PLANS.PRO.projectsPerMonth}
              features={PLANS.PRO.features}
              isPopular
            />
            <PricingTier
              name={PLANS.EXPERT.name}
              price={PLANS.EXPERT.price}
              annualPrice={isAnnual ? PLANS.EXPERT.annualPrice : undefined}
              projectsPerMonth={PLANS.EXPERT.projectsPerMonth}
              features={PLANS.EXPERT.features}
            />
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Passer cette étape pour le moment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

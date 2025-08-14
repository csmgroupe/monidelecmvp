import { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PATHS } from '@/config/paths';

interface ProjectStepLayoutProps {
  children: ReactNode;
  currentStep: number;
  onNext?: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
  nextDisabled?: boolean;
  previousDisabled?: boolean;
  nextButtonText?: string;
  nextDisabledReason?: string | null;
}

const steps = [
  { number: 1, title: 'Projet', shortTitle: 'Projet', path: 'info' },
  { number: 2, title: 'Plan', shortTitle: 'Plan', path: 'plan' },
  { number: 3, title: 'Pièces', shortTitle: 'Pièces', path: 'rooms' },
  { number: 4, title: 'Équipements', shortTitle: 'Équip.', path: 'equipment' },
  { number: 5, title: 'Options', shortTitle: 'Options', path: 'options' },
  { number: 6, title: 'Récapitulatif', shortTitle: 'Récap.', path: 'summary' },
  { number: 7, title: 'Dimensionnement', shortTitle: 'Dimen.', path: 'dimensioning' },
  { number: 8, title: 'Estimations', shortTitle: 'Estim.', path: 'quote' },
];

export function ProjectStepLayout({ 
  children, 
  currentStep, 
  onNext, 
  onPrevious, 
  isLoading = false,
  nextDisabled = false,
  previousDisabled = false,
  nextButtonText,
  nextDisabledReason
}: ProjectStepLayoutProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleBackToList = () => {
    navigate(PATHS.abplan.list);
  };

  const handleStepClick = (stepPath: string) => {
    if (id && id !== 'new') {
      navigate(`/projects/${id}/${stepPath}`);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  return (
    <div className="mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={handleBackToList}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
        >
          ← Retour aux projets
        </button>
      </div>

      <div className="mb-8">
        <div className="block lg:hidden">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                {currentStep}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {steps.find(s => s.number === currentStep)?.title}
                </p>
                <p className="text-xs text-gray-500">
                  Étape {currentStep} sur {steps.length}
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`w-2 h-2 rounded-full ${
                    step.number === currentStep
                      ? 'bg-blue-600'
                      : step.number < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Version desktop - stepper horizontal optimisé */}
        <div className="hidden lg:block">
          <div className="relative flex items-center justify-between">
            {/* Ligne de progression de fond */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" aria-hidden="true" />
            {/* Ligne de progression colorée */}
            <div 
              className="absolute left-0 top-5 h-0.5 bg-green-500 transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              aria-hidden="true" 
            />
            
            {steps.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center bg-gray-50 px-2">
                <button
                  onClick={() => handleStepClick(step.path)}
                  disabled={id === 'new' || step.number > currentStep}
                  className={`group relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    step.number === currentStep
                      ? 'bg-blue-600 text-white scale-110 shadow-lg'
                      : step.number < currentStep
                      ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
                      : 'bg-gray-50 text-gray-500 border-2 border-gray-300'
                  } ${id !== 'new' && step.number <= currentStep ? 'cursor-pointer' : 'cursor-default'}`}
                  title={step.title}
                >
                  {step.number < currentStep ? '✓' : step.number}
                </button>
                <span className={`mt-2 text-sm font-medium transition-colors ${
                  step.number === currentStep ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.shortTitle}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg shadow-sm">
        {children}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1 || isLoading || previousDisabled}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>
        
        <div className="relative group">
          <button
            onClick={handleNext}
            disabled={nextDisabled}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nextButtonText && nextButtonText.includes('jeton') ? (
              <div className="flex flex-col items-center">
                <span className="font-medium">Valider le projet</span>
                <span className="text-xs font-normal opacity-80">-1 jeton</span>
              </div>
            ) : (
              <>
                {nextButtonText || (currentStep === steps.length ? 'Générer la liste' : 'Suivant')}
                {!isLoading && <ChevronRight className="w-4 h-4" />}
              </>
            )}
          </button>
          
          {/* Tooltip for disabled next button */}
          {nextDisabled && nextDisabledReason && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
              {nextDisabledReason}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
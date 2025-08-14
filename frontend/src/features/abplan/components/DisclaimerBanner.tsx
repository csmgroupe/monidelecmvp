import { AlertTriangle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
      <div className="flex">
        <AlertTriangle className="h-6 w-6 text-yellow-400" />
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Les estimations et projections fournies par notre IA sont données à titre indicatif. 
            Nous ne pouvons garantir leur exactitude absolue. Veuillez toujours faire valider 
            vos projets par un professionnel qualifié.
          </p>
        </div>
      </div>
    </div>
  );
}
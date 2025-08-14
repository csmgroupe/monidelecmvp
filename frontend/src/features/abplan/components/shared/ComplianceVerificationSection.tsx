import { Shield, RefreshCw, Wand2, ShieldCheck, ShieldX } from 'lucide-react';
import React from 'react';
import type { RoomEquipmentValidationResponseDtoContract } from '@/api/generated/data-contracts';

interface ComplianceVerificationSectionProps {
  complianceResult: RoomEquipmentValidationResponseDtoContract | null;
  isValidating: boolean;
  complianceError: string | null;
  /* When true, the suggestions button is displayed */
  hasSuggestions?: boolean;
  /* Loading state for the suggestions action */
  isApplyingSuggestions?: boolean;
  /* Triggered when the user clicks on "Appliquer les suggestions" */
  applySuggestions?: () => void;
  /* Triggered when the user wants to re-validate */
  validateCompliance: () => void;
  /* Disable actions when an external modal is open */
  isEquipmentsModalOpen?: boolean;
  /* Indicates that the compliance result does not match the current data */
  isResultStale?: boolean;
  /* Optional list of rooms to resolve room_id → label */
  rooms?: { id: string; label: string }[];
}

export function ComplianceVerificationSection({
  complianceResult,
  isValidating,
  complianceError,
  hasSuggestions = false,
  isApplyingSuggestions = false,
  applySuggestions,
  validateCompliance,
  isEquipmentsModalOpen = false,
  isResultStale = false,
  rooms = [],
}: ComplianceVerificationSectionProps) {
  const isGloballyCompliant =
    complianceResult?.global_compliance?.overall_status === 'compliant';

  const canApplySuggestions =
    hasSuggestions && !!applySuggestions && !isResultStale;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-gray-500" />
            Vérification de la norme NF C 15-100
          </h3>
          <div className="flex items-center space-x-3">
            {canApplySuggestions && (
              <button
                onClick={applySuggestions}
                disabled={isApplyingSuggestions || isValidating || isEquipmentsModalOpen}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplyingSuggestions ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Application...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Appliquer les suggestions
                  </>
                )}
              </button>
            )}
            <button
              onClick={validateCompliance}
              disabled={isValidating || isApplyingSuggestions || isEquipmentsModalOpen}
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Revérifier la norme
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        {isValidating ? (
          <div className="flex items-center text-blue-600 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            <span>Vérification de la conformité en cours...</span>
          </div>
        ) : complianceError ? (
          <div className="space-y-4">
            <div className="flex items-start p-4 rounded-lg bg-red-50 border border-red-200">
              <ShieldX className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Erreur de validation NF C 15-100</p>
                <p className="text-red-700 text-sm mt-1">{complianceError}</p>
                <button
                  onClick={validateCompliance}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        ) : complianceResult ? (
          <div className="space-y-4">
            {/* Global compliance status */}
            <div
              className={`flex items-center p-4 rounded-lg ${
                isGloballyCompliant
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {isGloballyCompliant ? (
                <>
                  <ShieldCheck className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <p className="text-green-800 font-medium">Installation conforme NF C 15-100</p>
                    <p className="text-green-700 text-sm">Toutes les exigences de la norme sont respectées.</p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldX className="w-6 h-6 text-red-600 mr-3" />
                  <div>
                    <p className="text-red-800 font-medium">Installation non conforme NF C 15-100</p>
                    {complianceResult.global_compliance?.violations?.map((violation, index) => (
                      <p key={index} className="text-red-700 text-sm">
                        {violation.message}
                      </p>
                    ))}
                    {(() => {
                      if (!complianceResult.room_results) return null;
                      const nonCompliant = complianceResult.room_results.filter(
                        (r) => r.compliance_status !== 'compliant',
                      );
                      if (nonCompliant.length === 0) return null;

                      const labelOf = (roomId: string) => {
                        const found = rooms.find((r) => r.id === roomId);
                        return found?.label || `Pièce ${roomId}`;
                      };

                      return (
                        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-red-700">
                          {nonCompliant.map((r) => (
                            <li key={r.room_id}>
                              {labelOf(r.room_id)}
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            <p>Cliquez sur "Vérifier" pour valider la conformité de votre installation électrique.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
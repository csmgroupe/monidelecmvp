import { useState } from 'react';
import { History, ArrowRight, Trash2, AlertTriangle, Loader2, Square, Upload } from 'lucide-react';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';
import { useDeleteProject } from '@/features/shared/hooks/projects/useDeleteProject';
import { useProjectRooms } from '@/features/shared/hooks/plans/useProjectRooms';
import { useQuotesByProject } from '@/features/shared/hooks/quotes/useQuotesByProject';

interface ProjectCardProps {
  project: Project & { surface_loi_carrez?: number };
  onClick: () => void;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  variant?: 'home' | 'projects';
}

export const ProjectCard = ({ 
  project, 
  onClick, 
  showDeleteButton = false, 
  onDelete,
  variant = 'home' 
}: ProjectCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteProjectMutation = useDeleteProject();

  const firstPlan = project.planFiles?.[0];

  const { data: projectRooms, isLoading: isLoadingRooms } = useProjectRooms(project.id);
  const surfaceLoiCarrez = projectRooms?.surfaceLoiCarrez;

  const { data: quotesData, isLoading: isLoadingQuotes } = useQuotesByProject(project.id);
  const completedQuote = quotesData?.find((q: any) => q.status === 'completed');
  const fallbackQuote = project.status === 'completed' && !completedQuote && quotesData?.length > 0 
    ? quotesData[quotesData.length - 1] 
    : null;
  const totalAmountHt = (completedQuote?.totalAmount || fallbackQuote?.totalAmount) as number | undefined;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    deleteProjectMutation.mutate(project.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        onDelete?.();
      },
      onError: (error) => {
        console.error('Erreur lors de la suppression:', error);
      }
    });
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const baseClasses = variant === 'home' 
    ? "bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
    : "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer";

  return (
    <>
      <div className={baseClasses} onClick={onClick}>
        {/* Prévisualisation du plan ou placeholder */}
        {firstPlan?.publicUrl ? (
          <div className="mb-3 relative">
            <img 
              src={firstPlan.publicUrl} 
              alt={`Plan de ${project.name}`}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {project.planFiles?.length || 0} plan{project.planFiles && project.planFiles.length > 1 ? 's' : ''}
            </div>
          </div>
        ) : (
          <div className="mb-3 flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg h-32 cursor-pointer transition hover:bg-gray-100" onClick={e => { e.stopPropagation(); onClick(); }}>
            <Upload className="w-8 h-8 text-gray-300 mb-2" />
            <span className="text-xs text-gray-500 font-medium">Aucun plan ajouté</span>
            <span className="text-xs text-gray-400 mb-2">Ajoutez un plan pour compléter votre projet</span>
            <button
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
            >
              Ajouter un plan
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900 truncate pr-2">{project.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              project.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {project.status === 'completed' ? 'Terminé' : 'En cours'}
            </span>
            {showDeleteButton && (
              <button
                onClick={handleDeleteClick}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Supprimer le projet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {project.status === 'completed' && !isLoadingQuotes && totalAmountHt !== undefined && (
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Prix HT :</span>
            <span className="text-sm text-gray-900">{totalAmountHt.toFixed(2)} €</span>
          </div>
        )}

        {/* Surface du projet */}
        {isLoadingRooms ? (
          <div className="flex items-center text-sm text-gray-400 mb-2 animate-pulse">
            <Square className="w-4 h-4 mr-1" />
            <span>Chargement…</span>
          </div>
        ) : surfaceLoiCarrez && surfaceLoiCarrez > 0 ? (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Square className="w-4 h-4 mr-1" />
            <span>Surface totale : {surfaceLoiCarrez.toFixed(1)} m²</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <History className="w-4 h-4 mr-1" />
            {new Date(project.updatedAt).toLocaleDateString('fr-FR')}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
        
        {project.description && (
          <p className="mt-2 text-sm text-gray-600 truncate">{project.description}</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Supprimer le projet</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le projet "{project.name}" ? 
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteProjectMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleteProjectMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authSelectors } from '@/modules/auth/application/auth.selectors';
import { useSelector } from 'react-redux';
import { useRecentProjects } from '@/features/shared/hooks/projects/useRecentProjects';
import { RecentProjectCard } from '../components/RecentProjectCard';
import type { Project } from '@/modules/abplan/projects/domain/project.entity';
import { PATHS } from '@/config/paths';
import { Plus, History, ArrowRight, Loader2 } from 'lucide-react';

export const Dashboard = () => {
  const user = useSelector(authSelectors.getUser);
  const [subscription] = useState<number | null>(0);
  const navigate = useNavigate();
  
  const { data: recentProjectsData, isLoading: isLoadingRecentProjects } = useRecentProjects();

  const handleNewProject = () => {
    navigate(PATHS.abplan.new);
  };

  const handleProjectClick = (project: Project) => {
    if (project.id) {
      // Navigate to the appropriate step based on project status
      if (project.status === 'completed') {
        // For completed projects, go to summary
        navigate(PATHS.abplan.steps.summary(project.id));
      } else {
        // For draft/ongoing projects, go to info step to continue
        navigate(PATHS.abplan.steps.info(project.id));
      }
    }
  };
  
  return (
    <>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour {(user as any)?.user_metadata?.firstName || 'utilisateur'} 👋
            </h1>
            <p className="mt-1 text-gray-600">
              Bienvenue sur votre espace personnel
            </p>
          </div>

          {/* {!subscription && (
            <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Activez votre abonnement</h2>
                  <p className="text-indigo-100">
                    Choisissez un forfait pour accéder à toutes les fonctionnalités d'Ab'Services
                  </p>
                </div>
                <Link
                  to="/pricing"
                  className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                >
                  Voir les forfaits
                </Link>
              </div>
            </div>
          )} */}

          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Projets récents</h2>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/projects"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Voir tous les projets
                  </Link>
                  <button
                    onClick={handleNewProject}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau projet
                  </button>
                </div>
              </div>
              
              {isLoadingRecentProjects ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 text-indigo-600 animate-spin" />
                  <p className="mt-2 text-gray-500">Chargement des projets récents...</p>
                </div>
              ) : recentProjectsData && recentProjectsData.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentProjectsData.projects.map((project: Project) => (
                    <RecentProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => handleProjectClick(project)}
                    />
                  ))}
                </div>
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Commencez votre premier projet</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Importez vos plans et laissez Mon ID Elec vous aider à optimiser vos chiffrages
                  </p>
                  <button
                    onClick={handleNewProject}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau projet
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Conseils et astuces */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Conseils pour bien démarrer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Préparez vos plans</h3>
                <p className="text-sm text-gray-600">
                  Assurez-vous que vos plans sont au format PDF ou image (PNG, JPG) pour une analyse optimale avec Mon ID Elec
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Organisez vos projets</h3>
                <p className="text-sm text-gray-600">
                  Créez des dossiers par client ou par type de projet pour retrouver facilement vos analyses
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Validez les résultats</h3>
                <p className="text-sm text-gray-600">
                  Vérifiez et ajustez les suggestions de l'IA pour garantir des estimations précises
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

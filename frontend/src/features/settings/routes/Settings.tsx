import { CreditCard, Building2, User, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { authSelectors } from '@/modules/auth/application/auth.selectors';

export const Settings = () => {
  const user = useSelector(authSelectors.getUser);
  const subscription = 0;

  return (
    <>
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Paramètres du compte
          </h1>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations personnelles</h2>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <div className="mt-1 flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{user?.user_metadata?.firstName}</span>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <div className="mt-1 flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{user?.user_metadata?.lastName}</span>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations société</h2>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Nom de la société</label>
                  <div className="mt-1 flex items-center">
                    <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{user?.user_metadata?.company}</span>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">SIRET</label>
                  <div className="mt-1 flex items-center">
                    <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{user?.user_metadata?.siret}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sécurité</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Mot de passe</p>
                  <p className="text-sm text-gray-500">Gérez votre mot de passe de connexion</p>
                </div>
                <Link
                  to="/update-password"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Modifier
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Forfait actuel</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                {subscription ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{subscription.plan_id}</p>
                      <p className="text-sm text-gray-500">{subscription.credits_remaining} projets restants</p>
                    </div>
                    <Link
                      to="/pricing"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Changer de forfait
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-4">Vous n'avez pas d'abonnement actif</p>
                    <Link
                      to="/pricing"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Choisir un forfait
                    </Link>
                  </div>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}

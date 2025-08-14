import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useConfirmResetPassword } from '@/features/shared/hooks/auth/useConfirmResetPassword';

type ConfirmResetPasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

export const ConfirmResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('token_hash');
  const { mutateAsync: confirmResetPassword, isPending, error } = useConfirmResetPassword();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<ConfirmResetPasswordForm>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ConfirmResetPasswordForm) => {
    if (!code) {
      setError('newPassword', {
        type: 'manual',
        message: 'Token de réinitialisation manquant'
      });
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Les mots de passe ne correspondent pas'
      });
      return;
    }

    try {
      await confirmResetPassword({
        code,
        newPassword: data.newPassword,
      });
      navigate('/auth/login');
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left column - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10" />
        <img
          src="https://images.unsplash.com/photo-1555421689-491a97ff2040?ixlib=rb-4.0.3"
          alt="Password reset concept"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-end p-12 text-white">
          <h1 className="text-5xl font-bold mb-4">
            Mon ID Elec
          </h1>
          <p className="text-xl font-light max-w-md mb-8">
            Créez un nouveau mot de passe sécurisé pour votre compte 🔐
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Sécurité renforcée
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Accès protégé
            </div>
          </div>
        </div>
      </div>

      {/* Right column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm flex flex-col items-center">
          <div className="text-center">
            <Logo className="h-12" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Nouveau mot de passe
            </h2>
            <p className="mt-2 text-gray-600">
              Choisissez un mot de passe sécurisé pour votre compte
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8 w-full">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {typeof error === 'object' && 'message' in error 
                  ? error.message 
                  : "Échec de la réinitialisation. Veuillez réessayer."}
              </div>
            )}

            {!code && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                Token de réinitialisation manquant. Veuillez utiliser le lien reçu par email.
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="••••••••"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.newPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  {...register('newPassword', { 
                    required: 'Le nouveau mot de passe est requis',
                    minLength: {
                      value: 6,
                      message: 'Le mot de passe doit contenir au moins 6 caractères'
                    }
                  })}
                />
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  {...register('confirmPassword', { 
                    required: 'La confirmation du mot de passe est requise',
                    validate: value => value === newPassword || 'Les mots de passe ne correspondent pas'
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending || !code}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </button>
            </div>

            <div className="text-center">
              <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

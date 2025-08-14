import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useResetPassword } from '@/features/shared/hooks/auth/useResetPassword';
import { useState } from 'react';

type ResetPasswordForm = {
  email: string;
};

export const ResetPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { mutateAsync: resetPassword, isPending, error } = useResetPassword();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetPasswordForm>();

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      await resetPassword(data.email);
      setIsEmailSent(true);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex">
        {/* Left column - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10" />
          <img
            src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3"
            alt="Email sent concept"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 flex flex-col justify-end p-12 text-white">
            <h1 className="text-5xl font-bold mb-4">
              Mon ID Elec
            </h1>
            <p className="text-xl font-light max-w-md mb-8">
              Vérifiez votre boîte email pour continuer 📧
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email sécurisé
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Lien temporaire
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Success message */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm flex flex-col items-center">
            <div className="text-center">
              <Logo className="h-12" />
              <div className="mt-6 flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                Email envoyé !
              </h2>
              <p className="mt-2 text-gray-600">
                Nous avons envoyé un lien de réinitialisation à{' '}
                <span className="font-medium text-gray-900">{getValues('email')}</span>
              </p>
            </div>

            <div className="mt-8 w-full space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                <div className="flex">
                  <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium">Vérifiez votre boîte email</p>
                    <p className="mt-1">
                      Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe. 
                      Le lien expire dans 1 heure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Vous n'avez pas reçu l'email ?
                </p>
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Renvoyer l'email
                </button>
              </div>

              <div className="text-center">
                <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  ← Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left column - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10" />
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3"
          alt="Password reset concept"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-end p-12 text-white">
          <h1 className="text-5xl font-bold mb-4">
            Mon ID Elec
          </h1>
          <p className="text-xl font-light max-w-md mb-8">
            Récupérez l'accès à votre compte en quelques clics 🔑
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Récupération rapide
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Processus sécurisé
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
              Mot de passe oublié ?
            </h2>
            <p className="mt-2 text-gray-600">
              Saisissez votre adresse email pour recevoir un lien de réinitialisation
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8 w-full">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {typeof error === 'object' && 'message' in error 
                  ? error.message 
                  : "Impossible d'envoyer l'email. Veuillez réessayer."}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="votre@email.com"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  {...register('email', { 
                    required: "L'adresse email est requise",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "L'adresse email n'est pas valide"
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
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
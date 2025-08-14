import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '@/features/shared/hooks/auth/useLogin';
import { LoginCredentials } from '@/modules/auth/domain/auth.entity';

export const Login = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { mutateAsync: login, isPending, error, isError } = useLogin();

  const handleSubmit = async ({ email, password }: LoginCredentials) => {
    await login({ email, password });
    navigate('/dashboard');
  };

  // const handleResetPassword = async () => {
  //   if (!email) {
  //     setResetError('Veuillez saisir votre adresse email');
  //     return;
  //   }
  //   try {
  //     setResetError('');
  //     setResetLoading(true);
  //     await resetPassword(email);
  //     alert('Un email de réinitialisation a été envoyé à votre adresse.');
  //   } catch (err) {
  //     setResetError("Impossible d'envoyer l'email de réinitialisation.");
  //   } finally {
  //     setResetLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen flex">
      {/* Left column - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10" />
        <img
          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3"
          alt="Modern office interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-end p-12 text-white">
          <h1 className="text-5xl font-bold mb-4">
            Mon ID Elec
          </h1>
          <p className="text-xl font-light max-w-md mb-8">
            Connectez-vous à votre espace pour accéder à vos projets et analyses 🚀
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Accès sécurisé
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Interface intuitive
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
              Heureux de vous revoir 👋
            </h2>
            <p className="mt-2 text-gray-600">
              Pas encore inscrit ?{' '}
              <Link to="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                C'est par ici !
              </Link>
            </p>
          </div>

          <div className="mt-8 w-full">
            <LoginForm
              email={email}
              setEmail={setEmail}
              error={error && typeof error === 'object' && 'message' in error ? error.message as string : undefined}
              loading={isPending}
              onSubmit={handleSubmit}
            />
            
            <div className="mt-4 text-center">
              <Link 
                to="/auth/reset-password" 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

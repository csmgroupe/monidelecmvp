import { useForm } from "react-hook-form";
import { LoginCredentials } from '@/modules/auth/domain/auth.entity';
import { FormEvent } from "react";

type LoginFormProps = {
  email: string;
  setEmail: (value: string) => void;
  error?: string;
  loading: boolean;
  onSubmit: (data: LoginCredentials) => Promise<void>;
  // onResetPassword: () => Promise<void>;
}

export const LoginForm = ({
  email,
  setEmail,
  error,
  loading,
  onSubmit,
  // onResetPassword
}: LoginFormProps) => {

  const { register } = useForm<LoginCredentials>();

  const onNativeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries()) as Record<string, string>;
  
    console.log("Form values (from FormData):", values);
  
    onSubmit({
      email: values.email,
      password: values.password
    });
  };
  

  return (
    <form className="space-y-6" onSubmit={onNativeSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {/* {resetError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {resetError}
        </div>
      )} */}
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
            {...register("email")}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="thomas@edison.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            {...register("password")}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        {/* <button
          type="button"
          onClick={onResetPassword}
          disabled={resetLoading}
          className="w-full text-center mt-4 text-sm text-indigo-600 hover:text-indigo-500"
        >
          {resetLoading ? 'Envoi en cours...' : 'Mot de passe oublié ?'}
        </button> */}
      </div>
    </form>
  );
};

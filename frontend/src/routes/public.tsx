import { PATHS } from '@/config/paths';
import { Login } from '@/features/auth/routes/Login';
import { RouteObject } from 'react-router-dom';
import { PublicAppLayout } from './PublicAppLayout';
import { Register } from '@/features/auth/routes/Register';
import { Landing } from '@/features/misc/routes/Landing';
import { ConfirmResetPassword } from '@/features/auth/routes/ConfirmResetPassword';
import { ResetPassword } from '@/features/auth/routes/ResetPassword';

export const publicRoutes: RouteObject[] = [
  {
    path: PATHS.landing.base,
    element: <PublicAppLayout />,
    children: [
      {
        path: PATHS.landing.base,
        element: <Landing />,
      },
    ],
  },
  {
    path: PATHS.auth.base,
    element: <PublicAppLayout />,
    children: [
      {
        path: PATHS.auth.login,
        element: <Login />,
      },
      {
        path: PATHS.auth.register,
        element: <Register />,
      },
      {
        path: PATHS.auth.confirmResetPassword,
        element: <ConfirmResetPassword />,
      },
      {
        path: PATHS.auth.resetPassword,
        element: <ResetPassword />,
      },
    ],
  },
];

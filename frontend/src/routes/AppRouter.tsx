import {
  RouterProvider,
  createBrowserRouter,
  RouteObject,
} from 'react-router-dom';
import { protectedRoutes } from './protected';
import { publicRoutes } from './public';
import { NotFound } from '@/features/misc/routes/NotFound';
import { Unauthorized } from '@/features/misc/routes/Unauthorized';
import { PATHS } from '@/config/paths';
import { ScrollToTop } from '@/components/ScrollToTop';

const createErrorRoutes = (): RouteObject[] => [
  {
    path: '*',
    element: <NotFound />,
  },
  {
    path: PATHS.errors.unauthorized,
    element: <Unauthorized />,
  },
];

export const AppRouter = () => {
  const router = createBrowserRouter(
    [...publicRoutes, ...protectedRoutes, ...createErrorRoutes()],
    {
      basename: '/',
    },
  );

  return <RouterProvider router={router} />;
};

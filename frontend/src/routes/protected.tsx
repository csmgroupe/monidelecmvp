import { PATHS } from '@/config/paths';
import { Navigate, RouteObject } from 'react-router-dom';
import { ProtectedAppLayout } from './ProtectedAppLayout';
import { Dashboard } from '@/features/dashboard/routes/Dashboard';
import { HeatPumpCalculator } from '@/features/heat-pump-calculator/routes/HeatPumpCalculator';
import { UpdatePassword } from '@/features/auth/routes/UpdatePassword';
import { Pricing } from '@/features/pricing/routes/Pricing';
import { Settings } from '@/features/settings/routes/Settings';
import { 
  ProjectList,
  ProjectInfo,
  ProjectPlan,
  ProjectRooms,
  ProjectEquipment,
  ProjectOptions,
  ProjectSummary,
  ProjectDimensioning,
  ProjectQuote
} from '@/features/abplan/routes';

export const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedAppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={PATHS.dashboard.base} replace />,
      },
      {
        path: PATHS.dashboard.base,
        element: <Dashboard />,
      },
      {
        path: PATHS.heatPumpCalculator.base,
        element: <HeatPumpCalculator />,
      },
      {
        path: PATHS.pricing.base,
        element: <Pricing />,
      },
      {
        path: PATHS.updatePassword.base,
        element: <UpdatePassword />,
      },
      {
        path: PATHS.settings.base,
        element: <Settings />,
      },
      // Project routes
      {
        path: PATHS.abplan.list,
        element: <ProjectList />,
      },
      {
        path: PATHS.abplan.new,
        element: <ProjectInfo />,
      },
      {
        path: '/projects/:id/info',
        element: <ProjectInfo />,
      },
      {
        path: '/projects/:id/plan',
        element: <ProjectPlan />,
      },
      {
        path: '/projects/:id/rooms',
        element: <ProjectRooms />,
      },
      {
        path: '/projects/:id/equipment',
        element: <ProjectEquipment />,
      },
      {
        path: '/projects/:id/options',
        element: <ProjectOptions />,
      },
      {
        path: '/projects/:id/summary',
        element: <ProjectSummary />,
      },
      {
        path: '/projects/:id/dimensioning',
        element: <ProjectDimensioning />,
      },
      {
        path: '/projects/:id/quote',
        element: <ProjectQuote />,
      },
      // Redirect old abplan route to new projects route
      {
        path: '/abplan',
        element: <Navigate to={PATHS.abplan.list} replace />,
      },
    ],
  },
];

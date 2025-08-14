import { Outlet } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { ScrollToTop } from '@/components/ScrollToTop';

export const PublicAppLayout = () => {
  return (
    <PublicRoute>
      <ScrollToTop />
      <Outlet />
    </PublicRoute>
  );
};

import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ScrollToTop } from '@/components/ScrollToTop';

export const ProtectedAppLayout = () => (
  <ProtectedRoute>
    <ScrollToTop />
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </ProtectedRoute>
);

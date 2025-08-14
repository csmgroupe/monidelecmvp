import { Toaster } from 'sonner';
import { reduxStore } from './store/reduxStore';
import { Provider } from 'react-redux';
import { AppRouter } from '@/routes/AppRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query';

export default function App() {
  return (
    <div>
      <Toaster position="bottom-left" richColors />
      <QueryClientProvider client={queryClient}>
        <Provider store={reduxStore}>
          <AppRouter />
        </Provider>
      </QueryClientProvider>
    </div>
  );
}

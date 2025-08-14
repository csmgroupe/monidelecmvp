import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';

const REACT_QUERY_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
};

export const queryClient = new QueryClient(REACT_QUERY_CONFIG);

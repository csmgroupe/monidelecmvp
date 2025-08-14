import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useQueryWithToast } from '../useQueryWithToast';
import { PropsWithChildren } from 'react';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('useQueryWithToast', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should not show error toast on successful query', async () => {
    const mockData = { id: 1 };

    const { result } = renderHook(
      () =>
        useQueryWithToast({
          queryKey: ['test'],
          queryFn: async () => mockData,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should show error toast with Error message', async () => {
    const error = new Error('API error');

    const { result } = renderHook(
      () =>
        useQueryWithToast({
          queryKey: ['test-error'],
          queryFn: async () => {
            throw error;
          },
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith(error.message);
  });

  it('should show default error message for non-Error objects', async () => {
    const { result } = renderHook(
      () =>
        useQueryWithToast({
          queryKey: ['test-string-error'],
          queryFn: async () => {
            throw 'String error';
          },
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith('An error occurred');
  });

  it('should preserve query options', async () => {
    const mockData = { id: 1 };
    const select = (data: typeof mockData) => data.id;

    const { result } = renderHook(
      () =>
        useQueryWithToast({
          queryKey: ['test-select'],
          queryFn: async () => mockData,
          select,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(mockData.id);
  });
});

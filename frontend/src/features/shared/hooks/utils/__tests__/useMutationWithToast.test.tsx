import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMutationWithToast } from '../useMutationWithToast';
import { PropsWithChildren } from 'react';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useMutationWithToast', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call success callback and show success toast on successful mutation', async () => {
    const successMessage = 'Operation successful';
    const onSuccess = vi.fn();
    const mockData = { id: 1 };

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn: async () => mockData,
          successMessage,
          onSuccess,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync(undefined);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData, undefined, undefined);
    expect(toast.success).toHaveBeenCalledWith(successMessage);
  });

  it('should show error toast with custom message on mutation error', async () => {
    const errorMessage = 'Custom error message';
    const error = new Error('API error');

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn: async () => {
            throw error;
          },
          errorMessage,
        }),
      { wrapper },
    );

    await act(async () => {
      try {
        await result.current.mutateAsync();
      } catch (e) {
        console.log(e);
        // Expected error
      }
    });

    expect(toast.error).toHaveBeenCalledWith(errorMessage, {
      description: error.message,
    });
  });

  it('should show default error message when no custom error message is provided', async () => {
    const error = new Error('API error');

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn: async () => {
            throw error;
          },
        }),
      { wrapper },
    );

    await act(async () => {
      try {
        await result.current.mutateAsync();
      } catch (e) {
        console.log(e);
        // Expected error
      }
    });

    expect(toast.error).toHaveBeenCalledWith('An error occurred', {
      description: error.message,
    });
  });

  it('should not show success toast when no success message is provided', async () => {
    const onSuccess = vi.fn();
    const mockData = { id: 1 };

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn: async () => mockData,
          onSuccess,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync(undefined);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData, undefined, undefined);
    expect(toast.success).not.toHaveBeenCalled();
  });
});

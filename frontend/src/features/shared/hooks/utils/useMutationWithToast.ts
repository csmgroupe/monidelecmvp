import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from '@tanstack/react-query';
import { toast } from 'sonner';

type MutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'onError' | 'onSuccess'
> & {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
};

export function useMutationWithToast<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  options: MutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { successMessage, errorMessage, onSuccess, ...mutationOptions } =
    options;

  const mutation = useMutation<TData, TError, TVariables, TContext>({
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(data, variables, context);
    },
    onError: error => {
      toast.error(errorMessage ?? 'An error occurred', {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  return mutation;
}

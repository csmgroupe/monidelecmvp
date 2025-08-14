import { useCallback, useRef } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

interface DebouncedMutationOptions<TData, TError, TVariables> extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  delay?: number;
}

export function useDebouncedMutation<TData = unknown, TError = Error, TVariables = void>(
  options: DebouncedMutationOptions<TData, TError, TVariables>
): UseMutationResult<TData, TError, TVariables> & {
  debouncedMutate: (variables: TVariables) => void;
} {
  const { mutationFn, delay = 1000, ...mutationOptions } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const pendingVariablesRef = useRef<TVariables>();

  const mutation = useMutation({
    mutationFn,
    ...mutationOptions,
  });

  const debouncedMutate = useCallback((variables: TVariables) => {
    // Store the latest variables
    pendingVariablesRef.current = variables;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (pendingVariablesRef.current) {
        mutation.mutate(pendingVariablesRef.current);
        pendingVariablesRef.current = undefined;
      }
    }, delay);
  }, [mutation, delay]);

  return {
    ...mutation,
    debouncedMutate,
  };
} 
import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';

type QueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = unknown[],
> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'onError'>;

export function useQueryWithToast<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = unknown[],
>(
  options: QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  const query = useQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...options,
  });

  if (query.error) {
    toast.error(
      query.error instanceof Error ? query.error.message : 'An error occurred',
    );
  }

  return query;
}

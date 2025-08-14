import { useAppDispatch } from '@/store/reduxStore';
import { getCurrentUser } from '@/modules/auth/application/use-cases/getCurrentUser';
import { AUTH_QUERY_KEYS } from '@/api/generated/Auth';
import { useQuery } from '@tanstack/react-query';

export const useCurrentUser = () => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.controllerGetUser],
    queryFn: async () => {
      await dispatch(getCurrentUser());
      return null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

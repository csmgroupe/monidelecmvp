import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/store/reduxStore';
import { logout } from '@/modules/auth/application/use-cases/logout';
import { useMutationWithToast } from '../utils/useMutationWithToast';

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutationWithToast({
    mutationFn: async () => {
      const result = await dispatch(logout());
      return result;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

import { useAppDispatch } from '@/store/reduxStore';
import { login } from '../../../../modules/auth/application/use-cases/login';
import { LoginCredentials } from '@/modules/auth/domain/auth.entity';
import { getCurrentUser } from '@/modules/auth/application/use-cases/getCurrentUser';
import { useMutationWithToast } from '../utils/useMutationWithToast';

export const useLogin = () => {
  const dispatch = useAppDispatch();

  return useMutationWithToast({
    mutationFn: async (credentials: LoginCredentials) => {
      const user = await dispatch(login(credentials));
      return user;
    },
    onSuccess: async () => {
      await dispatch(getCurrentUser());
    },
    errorMessage: 'Impossible de se connecter',
  });
};

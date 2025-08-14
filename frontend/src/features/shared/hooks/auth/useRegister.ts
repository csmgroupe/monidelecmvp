import { useAppDispatch } from '@/store/reduxStore';
import { getCurrentUser } from '@/modules/auth/application/use-cases/getCurrentUser';
import { RegisterCredentials } from '@/modules/auth/domain/auth.entity';
import { register } from '@/modules/auth/application/use-cases/register';
import { useMutationWithToast } from '../utils/useMutationWithToast';

export const useRegister = () => {
  const dispatch = useAppDispatch();

  return useMutationWithToast({
    mutationFn: async (credentials: RegisterCredentials) => {
      const user = await dispatch(register(credentials));
      return user;
    },
    onSuccess: async () => {
      await dispatch(getCurrentUser());
    },
  });
};

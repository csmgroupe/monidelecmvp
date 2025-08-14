import { useAppDispatch } from '@/store/reduxStore';
import { getCurrentUser } from '@/modules/auth/application/use-cases/getCurrentUser';
import { login } from '@/modules/auth/application/use-cases/login';
import { useMutationWithToast } from '../utils/useMutationWithToast';
import { updatePassword } from '@/modules/auth/application/use-cases/updatePassword';

export const useUpdatePassword = () => {
  const dispatch = useAppDispatch();

  return useMutationWithToast({
    mutationFn: async ({currentPassword, newPassword, email}: {currentPassword: string, newPassword: string, email: string}) => {
      const user = await dispatch(updatePassword(currentPassword, newPassword));
      return user;
    },
    onSuccess: async (_, {email, newPassword}) => {
      // Re-login the user with the new password
      await dispatch(login({ email, password: newPassword }));
      await dispatch(getCurrentUser());
    },
    errorMessage: 'Failed to update password',
  });
};

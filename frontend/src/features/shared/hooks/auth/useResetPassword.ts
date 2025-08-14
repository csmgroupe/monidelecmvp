import { useAppDispatch } from '@/store/reduxStore';
import { useMutationWithToast } from "../utils/useMutationWithToast";
import { resetPassword } from "@/modules/auth/application/use-cases/resetPassword";

export const useResetPassword = () => {
  const dispatch = useAppDispatch();

  return useMutationWithToast({
    mutationFn: async (email: string) => {
      const result = await dispatch(resetPassword(email));
      return result;
    },
  });
};

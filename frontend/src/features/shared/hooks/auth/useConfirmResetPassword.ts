import { confirmResetPassword } from "@/modules/auth/application/use-cases/confirmResetPassword";
import { useMutationWithToast } from "../utils/useMutationWithToast";
import { useAppDispatch } from "@/store/reduxStore";
import { PATHS } from "@/config/paths";
import { useNavigate } from "react-router-dom";

export const useConfirmResetPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutationWithToast({
    mutationFn: async ({code, newPassword}: {code: string, newPassword: string}) => {
      const result = await dispatch(confirmResetPassword({code, newPassword}));
      return result;
    },
    onSuccess: async () => {
      navigate(PATHS.auth.login);
    },
  });
};

import { useAppDispatch } from '@/store/reduxStore';
import { upload } from '@/modules/abplan/plans/application/use-cases/upload';
import { useMutationWithToast } from '../utils/useMutationWithToast';
import { PlansProvider } from '@/modules/abplan/plans/infrastructure/PlansProvider';
import { actions } from '@/modules/abplan/plans/application/plans.actions';

export const useUploadPlan = () => {
  const dispatch = useAppDispatch();
  const plansProvider = new PlansProvider();

  return useMutationWithToast({
    mutationFn: async ({ file, projectId }: { file: File, projectId?: string }) => {
      // Call provider directly to avoid Redux thunk complexity
      const result = await plansProvider.upload(file, projectId);
      // Dispatch action to update Redux state
      dispatch(actions.upload());
      return result;
    },
    errorMessage: `Erreur lors de l'upload du plan`,
  });
}; 
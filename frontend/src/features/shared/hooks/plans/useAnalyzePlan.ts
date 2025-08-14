import { useAppDispatch } from '@/store/reduxStore';
import { analyze } from '@/modules/abplan/plans/application/use-cases/analyze';
import { useMutationWithToast } from '../utils/useMutationWithToast';

export const useAnalyzePlan = () => {
  const dispatch = useAppDispatch();

  return useMutationWithToast({
    mutationFn: async (filePath: string) => {
      const result = await dispatch(analyze(filePath));
      return result;
    },
    errorMessage: `Erreur lors de l'analyse du plan`,
  });
}; 
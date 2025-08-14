import { AppThunk } from '@/store/reduxStore';
import { actions } from '../plans.actions';

export const upload: (file: File, projectId?: string) => AppThunk =
  (file, projectId) =>
  async (dispatch, _getState, { plansProvider }) => {
    const result = await plansProvider.upload(file, projectId);
    dispatch(actions.upload(result));
    return result;
  };

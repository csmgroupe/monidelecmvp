import { AppThunk } from '@/store/reduxStore';
import { actions } from '../plans.actions';

export const deletePlan: (id: string) => AppThunk =
  id =>
  async (dispatch, _getState, { plansProvider }) => {
    const result = await plansProvider.delete(id);
    dispatch(actions.delete(result));
    return result;
  };

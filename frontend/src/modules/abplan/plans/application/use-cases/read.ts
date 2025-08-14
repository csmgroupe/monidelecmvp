import { AppThunk } from '@/store/reduxStore';
import { actions } from '../plans.actions';

export const read: (id: string) => AppThunk =
  id =>
  async (dispatch, _getState, { plansProvider }) => {
    const result = await plansProvider.read(id);
    dispatch(actions.read(result));
    return result;
  };

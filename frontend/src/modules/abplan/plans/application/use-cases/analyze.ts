import { AppThunk } from '@/store/reduxStore';
import { actions } from '../plans.actions';

export const analyze: (filePath: string) => AppThunk =
  filePath =>
  async (dispatch, _getState, { plansProvider }) => {
    const result = await plansProvider.analyze(filePath);
    dispatch(actions.analyze(result));
    return result;
  };

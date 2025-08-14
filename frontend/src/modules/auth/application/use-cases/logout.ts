import { AppThunk } from '@/store/reduxStore';
import { actions } from '../auth.actions';

export const logout =
  (): AppThunk =>
  async (dispatch, _getState, { authProvider }) => {
    const logout = await authProvider.logout();
    dispatch(actions.logout());
    dispatch(actions.setUser({ user: null }));
    return logout;
  };

import { AppThunk } from '@/store/reduxStore';
import { actions } from '../auth.actions';

export const getCurrentUser =
  (): AppThunk =>
  async (dispatch, _getState, { authProvider }) => {
    try {
      const user = await authProvider.getCurrentUser();
      if (user) {
        dispatch(actions.login());
        dispatch(actions.setUser({ user }));
      }
      return user;
    } catch (error) {
      dispatch(actions.logout());
      throw error;
    }
  };

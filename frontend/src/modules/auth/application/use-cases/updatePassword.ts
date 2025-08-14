import { AppThunk } from '@/store/reduxStore';
import { actions } from '../auth.actions';

export const updatePassword: (currentPassword: string, newPassword: string) => AppThunk =
  (currentPassword, newPassword) =>
  async (dispatch, _getState, { authProvider }) => {
    const user = await authProvider.updatePassword({currentPassword, newPassword});
    dispatch(actions.updatePassword());
    return user;
  };

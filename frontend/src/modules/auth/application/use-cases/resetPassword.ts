import { AppThunk } from '@/store/reduxStore';

export const resetPassword: (emailAddress: string) => AppThunk =
  email =>
  async (_dispatch, _getState, { authProvider }) => {
    const result = await authProvider.resetPassword(email);
    return result;
  };

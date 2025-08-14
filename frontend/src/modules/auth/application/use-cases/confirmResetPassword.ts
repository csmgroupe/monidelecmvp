import { AppThunk } from '@/store/reduxStore';

export const confirmResetPassword: ({
  code,
  newPassword
}: {
  code: string;
  newPassword: string;
}) => AppThunk =
  ({code, newPassword}) =>
  async (_dispatch, _getState, { authProvider }) => {
    const result = await authProvider.confirmResetPassword({code, newPassword});
    return result;
  };

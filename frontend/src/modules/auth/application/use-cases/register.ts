import { AppThunk } from '@/store/reduxStore';
import { actions } from '../auth.actions';
import { RegisterCredentials } from '../../domain/auth.entity';

export const register =
  (credentials: RegisterCredentials): AppThunk =>
  async (dispatch, _getState, { authProvider }) => {
    await authProvider.register(credentials);
    const user = await authProvider.login(credentials);
    dispatch(actions.login());
    dispatch(actions.setUser({ user }));
    return user;
  };

import { AppThunk } from '@/store/reduxStore';
import { actions } from '../auth.actions';
import { LoginCredentials } from '../../domain/auth.entity';

export const login: (credentials: LoginCredentials) => AppThunk =
  credentials =>
  async (dispatch, _getState, { authProvider }) => {
    const user = await authProvider.login(credentials);
    dispatch(actions.login());
    dispatch(actions.setUser({ user }));
    return user;
  };

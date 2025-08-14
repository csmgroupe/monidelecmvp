import { createAction } from '@reduxjs/toolkit';
import { User } from '../domain/auth.entity';

enum Types {
  LOGIN = 'auth/login',
  LOGOUT = 'auth/logout',
  SET_USER = 'auth/setUser',
  UPDATE_PASSWORD = 'auth/updatePassword',
}

export const actions = {
  login: createAction(Types.LOGIN),
  logout: createAction(Types.LOGOUT),
  updatePassword: createAction(Types.UPDATE_PASSWORD),
  setUser: createAction<{ user: User | null }>(Types.SET_USER),
};

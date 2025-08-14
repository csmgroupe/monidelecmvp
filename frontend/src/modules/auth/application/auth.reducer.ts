import { createReducer } from '@reduxjs/toolkit';
import { actions } from './auth.actions';
import { User } from '../domain/auth.entity';

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

export const authReducer = createReducer(initialState, builder => {
  builder
    .addCase(actions.login, state => {
      state.isAuthenticated = true;
    })
    .addCase(actions.logout, state => {
      state.isAuthenticated = false;
      state.user = null;
    })
    .addCase(actions.setUser, (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
});

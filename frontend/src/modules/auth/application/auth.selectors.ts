import { AppState } from '@/store/appState';
import { AuthState } from './auth.reducer';

const getAuthState = (state: AppState): AuthState => {
  return state.auth;
};

const getUser = (state: AppState) => {
  return state.auth.user;
};

const getIsAuthenticated = (state: AppState) => {
  return state.auth.isAuthenticated;
};

export const authSelectors = {
  getAuthState,
  getUser,
  getIsAuthenticated,
};

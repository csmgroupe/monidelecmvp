import {
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../domain/auth.entity';

export interface AuthGateway {
  login(credentials: LoginCredentials): Promise<User>;
  register(credentials: RegisterCredentials): Promise<unknown>;
  getCurrentUser(): Promise<User>;
  logout(): Promise<void>;
  resetPassword(emailAddress: string): Promise<void>;
}

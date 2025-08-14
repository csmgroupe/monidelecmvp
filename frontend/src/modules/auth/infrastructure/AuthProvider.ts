import { Auth } from '@/api/generated/Auth';
import { LoginDtoContract, RegisterDtoContract } from '@/api/generated/data-contracts';
import { AuthGateway } from '../application/auth.gateway';
import {
  User,
} from '../domain/auth.entity';
import { PATHS } from '@/config/paths';

const authClient = new Auth();

export class AuthProvider implements AuthGateway {
  async login(credentials: LoginDtoContract): Promise<User> {
    return authClient.authControllerLogin(credentials);
  }

  async register(credentials: RegisterDtoContract): Promise<unknown> {
    return authClient.authControllerRegister(credentials);
  }

  async getCurrentUser(): Promise<User> {
    return authClient.authControllerGetUser();
  }

  async logout(): Promise<void> {
    return authClient.authControllerSignOut();
  }

  async resetPassword(email: string): Promise<void> {
    console.log('Reset password email sent to:', email);
    // Use environment variable for production or fallback to current origin
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const redirectUrl = baseUrl + PATHS.auth.confirmResetPassword;
    return authClient.authControllerResetPassword({email, redirectUrl});
  }

  async updatePassword({currentPassword, newPassword}: {currentPassword: string, newPassword: string}): Promise<void> {
    return authClient.authControllerUpdatePassword({currentPassword, newPassword});
  }

  async confirmResetPassword({code, newPassword}: {code: string, newPassword: string}): Promise<void> {
    return authClient.authControllerConfirmResetPassword({code, newPassword});
  }
}

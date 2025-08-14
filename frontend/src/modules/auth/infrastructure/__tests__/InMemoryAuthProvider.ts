import { AuthGateway } from '../../application/auth.gateway';
import {
  LoginCredentials,
  CommRegisterCredentials,
  PrestRegisterCredentials,
  User,
} from '../../domain/auth.entity';

export class InMemoryAuthProvider implements AuthGateway {
  #currentUser: User | null = null;
  #users: User[] = [];
  #validCredentials: LoginCredentials = {
    emailAddress: 'test@example.com',
    password: 'password123',
  };
  #failNextLogout = false;

  async login(credentials: LoginCredentials): Promise<User> {
    if (
      credentials.emailAddress === this.#validCredentials.emailAddress &&
      credentials.password === this.#validCredentials.password
    ) {
      this.#currentUser = {
        id: '1',
        emailAddress: credentials.emailAddress,
        type: 'COMMUSER',
      };
      return this.#currentUser;
    }
    throw new Error('Invalid credentials');
  }

  async registerComm(credentials: CommRegisterCredentials): Promise<unknown> {
    const existingUser = this.#users.find(
      user => user.emailAddress === credentials.emailAddress,
    );
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: String(this.#users.length + 1),
      emailAddress: credentials.emailAddress,
      type: 'COMMUSER',
    };

    this.#users.push(newUser);
    this.#currentUser = newUser;
    this.#validCredentials = credentials;
    return newUser;
  }

  async registerPrest(credentials: PrestRegisterCredentials): Promise<unknown> {
    const existingUser = this.#users.find(
      user => user.emailAddress === credentials.emailAddress,
    );
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: String(this.#users.length + 1),
      emailAddress: credentials.emailAddress,
      type: 'PRESTUSER',
    };

    this.#users.push(newUser);
    this.#currentUser = newUser;
    this.#validCredentials = credentials;
    return newUser;
  }

  async getCurrentUser(): Promise<User> {
    if (!this.#currentUser) {
      throw new Error('No user logged in');
    }
    return this.#currentUser;
  }

  async logout(): Promise<void> {
    if (this.#failNextLogout) {
      this.#failNextLogout = false;
      throw new Error('Logout failed');
    }
    this.#currentUser = null;
  }

  async resetPassword(emailAddress: string): Promise<void> {
    const user = this.#users.find(user => user.emailAddress === emailAddress);
    if (!user) {
      throw new Error('User not found');
    }
  }

  // Test helper methods
  feedCurrentUser(user: User) {
    this.#currentUser = {
      id: user.id,
      emailAddress: user.emailAddress,
      type: user.type,
    };
  }

  feedUsers(users: User[]) {
    this.#users = users;
  }

  setValidCredentials(credentials: LoginCredentials) {
    this.#validCredentials = credentials;
  }

  setFailNextLogout(fail: boolean) {
    this.#failNextLogout = fail;
  }
}

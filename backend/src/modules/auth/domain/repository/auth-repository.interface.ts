import { Auth } from '../entity/auth.entity';

export const AUTH_REPOSITORY_TOKEN = Symbol('IAuthRepository');

export interface IAuthRepository {
  findById(id: string): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  findByUserId(userId: string): Promise<Auth | null>;
  save(auth: Auth): Promise<Auth>;
  update(auth: Auth): Promise<Auth>;
  delete(id: string): Promise<void>;
}

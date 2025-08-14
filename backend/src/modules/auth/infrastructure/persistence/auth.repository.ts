import { EntityRepository } from '@mikro-orm/postgresql';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Auth } from '../../domain/entity/auth.entity';
import { IAuthRepository } from '../../domain/repository/auth-repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
  private readonly repository: EntityRepository<Auth>;
  private readonly em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
    this.repository = em.getRepository(Auth);
  }
  async findById(id: string): Promise<Auth | null> {
    return this.repository.findOne({ id });
  }

  async findByEmail(email: string): Promise<Auth | null> {
    return this.repository.findOne({ email });
  }

  async findByUserId(userId: string): Promise<Auth | null> {
    return this.repository.findOne({ user: userId });
  }

  async save(auth: Auth): Promise<Auth> {
    await this.em.persistAndFlush(auth);
    return auth;
  }

  async update(auth: Auth): Promise<Auth> {
    await this.em.flush();
    return auth;
  }

  async delete(id: string): Promise<void> {
    const auth = await this.findById(id);
    if (auth) {
      await this.em.removeAndFlush(auth);
    }
  }
}

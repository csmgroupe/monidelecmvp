import { EntityRepository } from '@mikro-orm/postgresql';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entity/user.entity';
import { IUserRepository } from '../../domain/repository/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly repository: EntityRepository<User>;
  private readonly em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
    this.repository = em.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ email });
  }

  async save(user: User): Promise<User> {
    await this.em.persistAndFlush(user);
    return user;
  }

  async update(user: User): Promise<User> {
    await this.em.flush();
    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      await this.em.removeAndFlush(user);
    }
  }

  async findAll(): Promise<User[]> {
    return this.repository.findAll();
  }
}

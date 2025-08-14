import { Entity, PrimaryKey, Property, OneToOne, Reference, wrap } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';
import { User } from '../../../user/domain/entity/user.entity';

@Entity({ tableName: 'auth' })
export class Auth {
  @PrimaryKey()
  id: string = uuidv7();

  @OneToOne(() => User)
  user: Reference<User>;

  @Property({ unique: true })
  email: string;

  @Property()
  password: string;

  @Property({ nullable: true })
  resetToken?: string;

  @Property({ nullable: true })
  resetTokenExpiry?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(
    user: User,
    email: string,
    password: string,
  ) {
    this.user = wrap(user).toReference();
    this.email = email;
    this.password = password;
  }
}

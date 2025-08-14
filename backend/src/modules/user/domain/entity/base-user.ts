import { Property } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/libs/base-entity';

export abstract class BaseUser extends BaseEntity {
  @Property({unique: true})
  email: string;

  @Property()
  public password: string;
}

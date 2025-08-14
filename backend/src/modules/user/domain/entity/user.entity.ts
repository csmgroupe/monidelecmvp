import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  id: string = uuidv7();

  @Property()
  company: string;

  @Property()
  siret: string;

  @Property()
  firstName: string;

  @Property()
  lastName: string;

  @Property({ unique: true })
  email: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(
    company: string,
    siret: string,
    firstName: string,
    lastName: string,
    email: string,
  ) {
    this.company = company;
    this.siret = siret;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
}

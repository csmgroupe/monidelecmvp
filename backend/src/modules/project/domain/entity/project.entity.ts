import { Entity, PrimaryKey, Property, ManyToOne, Reference, wrap } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';
import { User } from '../../../user/domain/entity/user.entity';

@Entity({ tableName: 'projects' })
export class Project {
  @PrimaryKey()
  id: string = uuidv7();

  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true, fieldName: 'type_projet' })
  typeProjet?: 'Résidentiel' | 'Tertiaire';

  @Property({ nullable: true, fieldName: 'type_travaux' })
  typeTravaux?: 'Construction' | 'Renovation';

  @Property({ nullable: true, fieldName: 'code_postal' })
  codePostal?: string;

  @ManyToOne(() => User)
  user: Reference<User>;

  @Property({ default: 'draft' })
  status: string = 'draft';

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true, fieldName: 'number_of_people' })
  numberOfPeople?: number;

  @Property({ nullable: true, type: 'json', fieldName: 'dimensioning_data' })
  dimensioningData?: any;

  constructor(
    name: string,
    user: User,
    description?: string,
    typeProjet?: 'Résidentiel' | 'Tertiaire',
    typeTravaux?: 'Construction' | 'Renovation',
    codePostal?: string
  ) {
    this.name = name;
    this.user = wrap(user).toReference();
    this.description = description;
    this.typeProjet = typeProjet;
    this.typeTravaux = typeTravaux;
    this.codePostal = codePostal;
  }
}

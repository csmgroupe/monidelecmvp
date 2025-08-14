import { Entity, PrimaryKey, Property, ManyToOne, Reference, Unique } from '@mikro-orm/core';
import { Project } from '../../../../project/domain/entity/project.entity';

@Entity({ tableName: 'project_rooms' })
@Unique({ properties: ['project'] }) // Each project can have only one current room configuration
export class ProjectRoomsEntity {
  @PrimaryKey()
  id!: string;

  @ManyToOne(() => Project, { deleteRule: 'cascade' })
  project!: Reference<Project>;

  @Property({ type: 'json' })
  rooms!: Array<{
    id: string;
    name: string;
    surface: number;
    options?: Record<string, any>;
  }>;

  @Property({ type: 'float' })
  surfaceLoiCarrez!: number;

  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
} 
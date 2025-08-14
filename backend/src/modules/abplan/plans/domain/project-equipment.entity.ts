import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';
import { Project } from '../../../project/domain/entity/project.entity';

export type EquipmentCategory = 'equipment' | 'option';

@Entity()
export class ProjectEquipment {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @Property()
  name: string;

  @Property()
  quantity: number = 1;

  @Property({ nullable: true })
  roomId?: string;

  @Property()
  category: EquipmentCategory = 'equipment';

  @Property({ nullable: true })
  type?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => Project, { deleteRule: 'cascade' })
  project: Project;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(data: {
    name: string;
    quantity?: number;
    roomId?: string;
    category?: EquipmentCategory;
    type?: string;
    metadata?: Record<string, any>;
    project: Project;
  }) {
    this.name = data.name;
    this.quantity = data.quantity || 1;
    this.roomId = data.roomId;
    this.category = data.category || 'equipment';
    this.type = data.type;
    this.metadata = data.metadata;
    this.project = data.project;
  }
} 
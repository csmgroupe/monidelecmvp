import { Entity, PrimaryKey, Property, ManyToOne, Reference, wrap } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';
import { Project } from '../../../project/domain/entity/project.entity';

@Entity({ tableName: 'quotes', schema: 'app' })
export class Quote {
  @PrimaryKey()
  id: string = uuidv7();

  @ManyToOne(() => Project, { deleteRule: 'cascade' })
  project: Reference<Project>;

  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ type: 'json' })
  quoteItems: any[];

  @Property({ type: 'json' })
  dimensioningItems: any[];

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Property({ default: 'draft' })
  status: 'draft' | 'completed' | 'sent' = 'draft';

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(
    project: Project,
    name: string,
    quoteItems: any[],
    dimensioningItems: any[],
    totalAmount: number,
    description?: string
  ) {
    this.project = wrap(project).toReference();
    this.name = name;
    this.quoteItems = quoteItems;
    this.dimensioningItems = dimensioningItems;
    this.totalAmount = totalAmount;
    this.description = description;
  }
} 
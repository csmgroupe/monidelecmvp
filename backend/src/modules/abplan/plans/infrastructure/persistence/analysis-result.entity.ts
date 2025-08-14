import { Entity, PrimaryKey, Property, ManyToOne, Reference } from '@mikro-orm/core';
import { Project } from '../../../../project/domain/entity/project.entity';

@Entity({ tableName: 'analysis_results' })
export class AnalysisResultEntity {
  @PrimaryKey()
  id!: string;

  @ManyToOne(() => Project, { deleteRule: 'cascade' })
  project!: Reference<Project>;

  @Property({ type: 'json' })
  rawAnalysis!: any;

  @Property()
  createdAt!: Date;
} 
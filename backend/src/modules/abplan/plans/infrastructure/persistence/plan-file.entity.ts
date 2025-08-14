import { Entity, PrimaryKey, Property, ManyToOne, Reference } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';
import { Project } from '../../../../project/domain/entity/project.entity';

@Entity({ tableName: 'plan_files', schema: 'app' })
export class PlanFileEntity {
  @PrimaryKey()
  id: string = uuidv7();

  @Property()
  originalName: string;

  @Property()
  filePath: string;

  @Property()
  contentType: string;

  @Property()
  size: number;

  @Property({ fieldName: 'sha256_hash' })
  sha256Hash: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => Project, { nullable: true, deleteRule: 'set null' })
  project?: Reference<Project>;

  constructor(
    originalName: string,
    filePath: string,
    contentType: string,
    size: number,
    sha256Hash: string,
    project?: Project,
  ) {
    this.originalName = originalName;
    this.filePath = filePath;
    this.contentType = contentType;
    this.size = size;
    this.sha256Hash = sha256Hash;
    if (project) {
      this.project = Reference.create(project);
    }
  }
} 
import { Reference, wrap } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';
import { Project } from '../../../project/domain/entity/project.entity';

export class AnalysisResult {
  id: string = uuidv7();
  project: Reference<Project>;
  rawAnalysis: any; // Store the complete BAML FloorPlanAnalysis result (immutable)
  createdAt: Date = new Date();

  constructor(
    project: Project,
    rawAnalysis: any
  ) {
    this.project = wrap(project).toReference();
    this.rawAnalysis = rawAnalysis;
  }

  static createFromBamlAnalysis(
    project: Project,
    bamlAnalysis: any
  ): AnalysisResult {
    return new AnalysisResult(
      project,
      bamlAnalysis
    );
  }
} 
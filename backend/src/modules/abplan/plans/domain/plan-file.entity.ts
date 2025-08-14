import { uuidv7 } from 'uuidv7';

export class PlanFile {
  constructor(
    private readonly _id: string,
    private readonly _originalName: string,
    private readonly _filePath: string,
    private readonly _contentType: string,
    private readonly _size: number,
    private readonly _uploadedAt: Date,
    private readonly _sha256Hash: string,
    private readonly _projectId?: string,
  ) {}

  get id(): string {
    return this._id;
  }

  get originalName(): string {
    return this._originalName;
  }

  get filePath(): string {
    return this._filePath;
  }

  get contentType(): string {
    return this._contentType;
  }

  get size(): number {
    return this._size;
  }

  get uploadedAt(): Date {
    return this._uploadedAt;
  }

  get sha256Hash(): string {
    return this._sha256Hash;
  }

  get projectId(): string | undefined {
    return this._projectId;
  }

  static create(
    originalName: string,
    contentType: string,
    size: number,
    sha256Hash: string,
    projectId?: string,
  ): PlanFile {
    const fileExt = originalName.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `plans/${fileName}`;
    const planId = uuidv7();
    
    return new PlanFile(
      planId,
      originalName,
      filePath,
      contentType,
      size,
      new Date(),
      sha256Hash,
      projectId,
    );
  }
}

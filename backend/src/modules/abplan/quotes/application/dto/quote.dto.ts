export class QuoteDto {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  quoteItems: any[];
  dimensioningItems: any[];
  totalAmount: number;
  status: 'draft' | 'completed' | 'sent';
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    projectId: string,
    name: string,
    quoteItems: any[],
    dimensioningItems: any[],
    totalAmount: number,
    status: 'draft' | 'completed' | 'sent',
    createdAt: Date,
    updatedAt: Date,
    description?: string
  ) {
    this.id = id;
    this.projectId = projectId;
    this.name = name;
    this.description = description;
    this.quoteItems = quoteItems;
    this.dimensioningItems = dimensioningItems;
    this.totalAmount = totalAmount;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
} 
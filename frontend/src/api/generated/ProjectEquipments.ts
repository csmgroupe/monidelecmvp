import {
  ApiConfig,
  ContentType,
  HttpClient,
  RequestParams,
} from './http-client';

export interface ProjectEquipmentDto {
  id?: string;
  name: string;
  quantity: number;
  roomId?: string;
  category: 'equipment' | 'option';
  type?: string;
  metadata?: Record<string, any>;
}

export interface UpdateProjectEquipmentsDto {
  projectId: string;
  equipments: ProjectEquipmentDto[];
}

export interface ProjectEquipmentsResponse {
  projectId: string;
  equipments: ProjectEquipmentDto[];
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_EQUIPMENTS_QUERY_KEYS = {
  getProjectEquipments: 'getProjectEquipments',
  updateProjectEquipments: 'updateProjectEquipments',
} as const;

export class ProjectEquipments extends HttpClient<unknown> {
  constructor(params?: Partial<ApiConfig>) {
    super({
      ...params,
      baseUrl: params?.baseUrl || '/api/v1',
    });
  }

  /**
   * Get project equipments and options
   */
  projectEquipmentsControllerGet = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<ProjectEquipmentsResponse>({
      path: `/project-equipments/${projectId}`,
      method: 'GET',
      ...params,
    });

  /**
   * Update project equipments and options
   */
  projectEquipmentsControllerUpdate = (
    data: UpdateProjectEquipmentsDto,
    params: RequestParams = {},
  ) =>
    this.request<ProjectEquipmentsResponse>({
      path: `/project-equipments`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      ...params,
    });
}

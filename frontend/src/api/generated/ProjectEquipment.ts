/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  ProjectEquipmentControllerGetProjectEquipmentsDataContract,
  ProjectEquipmentControllerUpdateProjectEquipmentsDataContract,
  UpdateProjectEquipmentsDtoContract,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class ProjectEquipment<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags ProjectEquipment
   * @name ProjectEquipmentControllerGetProjectEquipments
   * @request GET:/api/v1/project-equipments/{projectId}
   */
  projectEquipmentControllerGetProjectEquipments = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<
      ProjectEquipmentControllerGetProjectEquipmentsDataContract,
      any
    >({
      path: `/api/v1/project-equipments/${projectId}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags ProjectEquipment
   * @name ProjectEquipmentControllerUpdateProjectEquipments
   * @request PUT:/api/v1/project-equipments
   */
  projectEquipmentControllerUpdateProjectEquipments = (
    data: UpdateProjectEquipmentsDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<
      ProjectEquipmentControllerUpdateProjectEquipmentsDataContract,
      any
    >({
      path: `/api/v1/project-equipments`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      ...params,
    });
}

export const PROJECT_EQUIPMENT_QUERY_KEYS = {
  controllerGetProjectEquipments:
    'projectEquipmentControllerGetProjectEquipments',
  controllerUpdateProjectEquipments:
    'projectEquipmentControllerUpdateProjectEquipments',
};

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
  ProjectRoomsControllerGetProjectRoomsDataContract,
  ProjectRoomsControllerUpdateProjectRoomsDataContract,
  UpdateProjectRoomsDtoContract,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class ProjectRooms<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags ProjectRooms
   * @name ProjectRoomsControllerGetProjectRooms
   * @request GET:/api/v1/projects/{projectId}/rooms
   */
  projectRoomsControllerGetProjectRooms = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<ProjectRoomsControllerGetProjectRoomsDataContract, any>({
      path: `/api/v1/projects/${projectId}/rooms`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags ProjectRooms
   * @name ProjectRoomsControllerUpdateProjectRooms
   * @request PUT:/api/v1/projects/{projectId}/rooms
   */
  projectRoomsControllerUpdateProjectRooms = (
    projectId: string,
    data: UpdateProjectRoomsDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<ProjectRoomsControllerUpdateProjectRoomsDataContract, any>({
      path: `/api/v1/projects/${projectId}/rooms`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      ...params,
    });
}

export const PROJECT_ROOMS_QUERY_KEYS = {
  controllerGetProjectRooms: 'projectRoomsControllerGetProjectRooms',
  controllerUpdateProjectRooms: 'projectRoomsControllerUpdateProjectRooms',
};

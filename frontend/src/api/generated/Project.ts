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
  CreateProjectDtoContract,
  ProjectControllerCreateDataContract,
  ProjectControllerFindAllDataContract,
  ProjectControllerFindAllParamsContract,
  ProjectControllerFindOneDataContract,
  ProjectControllerGetPlanUrlDataContract,
  ProjectControllerRemoveDataContract,
  ProjectControllerUpdateDataContract,
  ProjectControllerUploadPlanDataContract,
  UpdateProjectDtoContract,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Project<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Project
   * @name ProjectControllerCreate
   * @request POST:/api/v1/projects
   */
  projectControllerCreate = (
    data: CreateProjectDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<ProjectControllerCreateDataContract, any>({
      path: `/api/v1/projects`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Project
   * @name ProjectControllerFindAll
   * @request GET:/api/v1/projects
   */
  projectControllerFindAll = (
    query: ProjectControllerFindAllParamsContract,
    params: RequestParams = {},
  ) =>
    this.request<ProjectControllerFindAllDataContract, any>({
      path: `/api/v1/projects`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags Project
   * @name ProjectControllerFindOne
   * @request GET:/api/v1/projects/{id}
   */
  projectControllerFindOne = (id: string, params: RequestParams = {}) =>
    this.request<ProjectControllerFindOneDataContract, any>({
      path: `/api/v1/projects/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Project
   * @name ProjectControllerUpdate
   * @request PUT:/api/v1/projects/{id}
   */
  projectControllerUpdate = (
    id: string,
    data: UpdateProjectDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<ProjectControllerUpdateDataContract, any>({
      path: `/api/v1/projects/${id}`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Project
   * @name ProjectControllerRemove
   * @request DELETE:/api/v1/projects/{id}
   */
  projectControllerRemove = (id: string, params: RequestParams = {}) =>
    this.request<ProjectControllerRemoveDataContract, any>({
      path: `/api/v1/projects/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Project
   * @name ProjectControllerUploadPlan
   * @request POST:/api/v1/projects/{id}/plan
   */
  projectControllerUploadPlan = (id: string, params: RequestParams = {}) =>
    this.request<ProjectControllerUploadPlanDataContract, any>({
      path: `/api/v1/projects/${id}/plan`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Project
   * @name ProjectControllerGetPlanUrl
   * @request GET:/api/v1/projects/{id}/plan/url
   */
  projectControllerGetPlanUrl = (id: string, params: RequestParams = {}) =>
    this.request<ProjectControllerGetPlanUrlDataContract, any>({
      path: `/api/v1/projects/${id}/plan/url`,
      method: 'GET',
      ...params,
    });
}

export const PROJECT_QUERY_KEYS = {
  controllerCreate: 'projectControllerCreate',
  controllerFindAll: 'projectControllerFindAll',
  controllerFindOne: 'projectControllerFindOne',
  controllerUpdate: 'projectControllerUpdate',
  controllerRemove: 'projectControllerRemove',
  controllerUploadPlan: 'projectControllerUploadPlan',
  controllerGetPlanUrl: 'projectControllerGetPlanUrl',
};

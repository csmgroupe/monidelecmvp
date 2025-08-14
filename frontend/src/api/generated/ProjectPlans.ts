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
  ProjectPlansControllerAnalyzeAllPlansDataContract,
  ProjectPlansControllerDeletePlanDataContract,
  ProjectPlansControllerGetPlanDataContract,
  ProjectPlansControllerGetPlansDataContract,
  ProjectPlansControllerPurgeProjectDataDataContract,
  ProjectPlansControllerUploadPlanDataContract,
} from './data-contracts';
import { HttpClient, RequestParams } from './http-client';

export class ProjectPlans<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags ProjectPlans
   * @name ProjectPlansControllerUploadPlan
   * @request POST:/api/v1/projects/{projectId}/plans/upload
   */
  projectPlansControllerUploadPlan = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<ProjectPlansControllerUploadPlanDataContract, any>({
      path: `/api/v1/projects/${projectId}/plans/upload`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags ProjectPlans
   * @name ProjectPlansControllerGetPlans
   * @request GET:/api/v1/projects/{projectId}/plans
   */
  projectPlansControllerGetPlans = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<ProjectPlansControllerGetPlansDataContract, any>({
      path: `/api/v1/projects/${projectId}/plans`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags ProjectPlans
   * @name ProjectPlansControllerGetPlan
   * @request GET:/api/v1/projects/{projectId}/plans/{planId}
   */
  projectPlansControllerGetPlan = (
    projectId: string,
    planId: string,
    params: RequestParams = {},
  ) =>
    this.request<ProjectPlansControllerGetPlanDataContract, any>({
      path: `/api/v1/projects/${projectId}/plans/${planId}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags ProjectPlans
   * @name ProjectPlansControllerDeletePlan
   * @request DELETE:/api/v1/projects/{projectId}/plans/{planId}
   */
  projectPlansControllerDeletePlan = (
    projectId: string,
    planId: string,
    params: RequestParams = {},
  ) =>
    this.request<ProjectPlansControllerDeletePlanDataContract, any>({
      path: `/api/v1/projects/${projectId}/plans/${planId}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags ProjectPlans
   * @name ProjectPlansControllerAnalyzeAllPlans
   * @request POST:/api/v1/projects/{projectId}/plans/analyze-all
   */
  projectPlansControllerAnalyzeAllPlans = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<ProjectPlansControllerAnalyzeAllPlansDataContract, any>({
      path: `/api/v1/projects/${projectId}/plans/analyze-all`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags ProjectPlans
   * @name ProjectPlansControllerPurgeProjectData
   * @request POST:/api/v1/projects/{projectId}/plans/purge
   */
  projectPlansControllerPurgeProjectData = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<ProjectPlansControllerPurgeProjectDataDataContract, any>({
      path: `/api/v1/projects/${projectId}/plans/purge`,
      method: 'POST',
      ...params,
    });
}

export const PROJECT_PLANS_QUERY_KEYS = {
  controllerUploadPlan: 'projectPlansControllerUploadPlan',
  controllerGetPlans: 'projectPlansControllerGetPlans',
  controllerGetPlan: 'projectPlansControllerGetPlan',
  controllerDeletePlan: 'projectPlansControllerDeletePlan',
  controllerAnalyzeAllPlans: 'projectPlansControllerAnalyzeAllPlans',
  controllerPurgeProjectData: 'projectPlansControllerPurgeProjectData',
};

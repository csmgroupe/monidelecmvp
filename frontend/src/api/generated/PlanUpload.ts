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
  PlanUploadControllerDeletePlanDataContract,
  PlanUploadControllerUploadPlanDataContract,
  PlanUploadControllerUploadPlanParamsContract,
} from './data-contracts';
import { HttpClient, RequestParams } from './http-client';

export class PlanUpload<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags PlanUpload
   * @name PlanUploadControllerUploadPlan
   * @request POST:/api/v1/abplan/plans/upload
   */
  planUploadControllerUploadPlan = (
    query: PlanUploadControllerUploadPlanParamsContract,
    params: RequestParams = {},
  ) =>
    this.request<PlanUploadControllerUploadPlanDataContract, any>({
      path: `/api/v1/abplan/plans/upload`,
      method: 'POST',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags PlanUpload
   * @name PlanUploadControllerDeletePlan
   * @request DELETE:/api/v1/abplan/plans/{path}
   */
  planUploadControllerDeletePlan = (path: string, params: RequestParams = {}) =>
    this.request<PlanUploadControllerDeletePlanDataContract, any>({
      path: `/api/v1/abplan/plans/${path}`,
      method: 'DELETE',
      ...params,
    });
}

export const PLAN_UPLOAD_QUERY_KEYS = {
  controllerUploadPlan: 'planUploadControllerUploadPlan',
  controllerDeletePlan: 'planUploadControllerDeletePlan',
};

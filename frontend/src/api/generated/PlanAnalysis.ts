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

import { PlanAnalysisControllerAnalyzePlanDataContract } from './data-contracts';
import { HttpClient, RequestParams } from './http-client';

export class PlanAnalysis<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags PlanAnalysis
   * @name PlanAnalysisControllerAnalyzePlan
   * @request POST:/api/v1/abplan/plans/analyze/{filePath}
   */
  planAnalysisControllerAnalyzePlan = (
    filePath: string,
    params: RequestParams = {},
  ) =>
    this.request<PlanAnalysisControllerAnalyzePlanDataContract, any>({
      path: `/api/v1/abplan/plans/analyze/${filePath}`,
      method: 'POST',
      ...params,
    });
}

export const PLAN_ANALYSIS_QUERY_KEYS = {
  controllerAnalyzePlan: 'planAnalysisControllerAnalyzePlan',
};

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
  AnalysisResultControllerDeleteAnalysisResultDataContract,
  AnalysisResultControllerGetAnalysisHistoryDataContract,
  AnalysisResultControllerGetLatestAnalysisResultDataContract,
} from './data-contracts';
import { HttpClient, RequestParams } from './http-client';

export class AnalysisResult<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags AnalysisResult
   * @name AnalysisResultControllerGetLatestAnalysisResult
   * @request GET:/api/v1/projects/{projectId}/analysis-results/latest
   */
  analysisResultControllerGetLatestAnalysisResult = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<
      AnalysisResultControllerGetLatestAnalysisResultDataContract,
      any
    >({
      path: `/api/v1/projects/${projectId}/analysis-results/latest`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags AnalysisResult
   * @name AnalysisResultControllerGetAnalysisHistory
   * @request GET:/api/v1/projects/{projectId}/analysis-results/history
   */
  analysisResultControllerGetAnalysisHistory = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<AnalysisResultControllerGetAnalysisHistoryDataContract, any>({
      path: `/api/v1/projects/${projectId}/analysis-results/history`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags AnalysisResult
   * @name AnalysisResultControllerDeleteAnalysisResult
   * @request DELETE:/api/v1/projects/{projectId}/analysis-results/{id}
   */
  analysisResultControllerDeleteAnalysisResult = (
    id: string,
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<AnalysisResultControllerDeleteAnalysisResultDataContract, any>(
      {
        path: `/api/v1/projects/${projectId}/analysis-results/${id}`,
        method: 'DELETE',
        ...params,
      },
    );
}

export const ANALYSIS_RESULT_QUERY_KEYS = {
  controllerGetLatestAnalysisResult:
    'analysisResultControllerGetLatestAnalysisResult',
  controllerGetAnalysisHistory: 'analysisResultControllerGetAnalysisHistory',
  controllerDeleteAnalysisResult:
    'analysisResultControllerDeleteAnalysisResult',
};

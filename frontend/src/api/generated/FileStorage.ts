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
  FileStorageControllerDeletePlanDataContract,
  FileStorageControllerUploadPlanDataContract,
} from './data-contracts';
import { HttpClient, RequestParams } from './http-client';

export class FileStorage<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags FileStorage
   * @name FileStorageControllerUploadPlan
   * @request POST:/api/v1/storage/upload/plan
   */
  fileStorageControllerUploadPlan = (params: RequestParams = {}) =>
    this.request<FileStorageControllerUploadPlanDataContract, any>({
      path: `/api/v1/storage/upload/plan`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags FileStorage
   * @name FileStorageControllerDeletePlan
   * @request DELETE:/api/v1/storage/plan/{path}
   */
  fileStorageControllerDeletePlan = (
    path: string,
    params: RequestParams = {},
  ) =>
    this.request<FileStorageControllerDeletePlanDataContract, any>({
      path: `/api/v1/storage/plan/${path}`,
      method: 'DELETE',
      ...params,
    });
}

export const FILE_STORAGE_QUERY_KEYS = {
  controllerUploadPlan: 'fileStorageControllerUploadPlan',
  controllerDeletePlan: 'fileStorageControllerDeletePlan',
};

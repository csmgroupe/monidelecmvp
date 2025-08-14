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

import { AppControllerGetHelloDataContract } from './data-contracts';
import { HttpClient, RequestParams } from './http-client';

export class App<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags App
   * @name AppControllerGetHello
   * @request GET:/api/v1
   */
  appControllerGetHello = (params: RequestParams = {}) =>
    this.request<AppControllerGetHelloDataContract, any>({
      path: `/api/v1`,
      method: 'GET',
      ...params,
    });
}

export const APP_QUERY_KEYS = {
  controllerGetHello: 'appControllerGetHello',
};

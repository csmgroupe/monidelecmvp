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
  CreateUserDtoContract,
  UpdateUserDtoContract,
  UserControllerCreateDataContract,
  UserControllerFindAllDataContract,
  UserControllerFindOneDataContract,
  UserControllerRemoveDataContract,
  UserControllerUpdateDataContract,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class User<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags User
   * @name UserControllerCreate
   * @request POST:/api/v1/user
   */
  userControllerCreate = (
    data: CreateUserDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<UserControllerCreateDataContract, any>({
      path: `/api/v1/user`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name UserControllerFindAll
   * @request GET:/api/v1/user
   */
  userControllerFindAll = (params: RequestParams = {}) =>
    this.request<UserControllerFindAllDataContract, any>({
      path: `/api/v1/user`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name UserControllerFindOne
   * @request GET:/api/v1/user/{id}
   */
  userControllerFindOne = (id: string, params: RequestParams = {}) =>
    this.request<UserControllerFindOneDataContract, any>({
      path: `/api/v1/user/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name UserControllerUpdate
   * @request PUT:/api/v1/user/{id}
   */
  userControllerUpdate = (
    id: string,
    data: UpdateUserDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<UserControllerUpdateDataContract, any>({
      path: `/api/v1/user/${id}`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name UserControllerRemove
   * @request DELETE:/api/v1/user/{id}
   */
  userControllerRemove = (id: string, params: RequestParams = {}) =>
    this.request<UserControllerRemoveDataContract, any>({
      path: `/api/v1/user/${id}`,
      method: 'DELETE',
      ...params,
    });
}

export const USER_QUERY_KEYS = {
  controllerCreate: 'userControllerCreate',
  controllerFindAll: 'userControllerFindAll',
  controllerFindOne: 'userControllerFindOne',
  controllerUpdate: 'userControllerUpdate',
  controllerRemove: 'userControllerRemove',
};

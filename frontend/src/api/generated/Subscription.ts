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
  CreateSubscriptionDtoContract,
  SubscriptionControllerCancelDataContract,
  SubscriptionControllerCreateDataContract,
  SubscriptionControllerFindByUserDataContract,
  SubscriptionControllerFindOneDataContract,
  SubscriptionControllerReactivateDataContract,
  SubscriptionControllerRemoveDataContract,
  SubscriptionControllerUpdateDataContract,
  UpdateSubscriptionDtoContract,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Subscription<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Subscription
   * @name SubscriptionControllerCreate
   * @request POST:/api/v1/subscription
   */
  subscriptionControllerCreate = (
    data: CreateSubscriptionDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<SubscriptionControllerCreateDataContract, any>({
      path: `/api/v1/subscription`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Subscription
   * @name SubscriptionControllerFindByUser
   * @request GET:/api/v1/subscription
   */
  subscriptionControllerFindByUser = (params: RequestParams = {}) =>
    this.request<SubscriptionControllerFindByUserDataContract, any>({
      path: `/api/v1/subscription`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Subscription
   * @name SubscriptionControllerFindOne
   * @request GET:/api/v1/subscription/{id}
   */
  subscriptionControllerFindOne = (id: string, params: RequestParams = {}) =>
    this.request<SubscriptionControllerFindOneDataContract, any>({
      path: `/api/v1/subscription/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Subscription
   * @name SubscriptionControllerUpdate
   * @request PUT:/api/v1/subscription/{id}
   */
  subscriptionControllerUpdate = (
    id: string,
    data: UpdateSubscriptionDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<SubscriptionControllerUpdateDataContract, any>({
      path: `/api/v1/subscription/${id}`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Subscription
   * @name SubscriptionControllerRemove
   * @request DELETE:/api/v1/subscription/{id}
   */
  subscriptionControllerRemove = (id: string, params: RequestParams = {}) =>
    this.request<SubscriptionControllerRemoveDataContract, any>({
      path: `/api/v1/subscription/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Subscription
   * @name SubscriptionControllerCancel
   * @request POST:/api/v1/subscription/cancel
   */
  subscriptionControllerCancel = (params: RequestParams = {}) =>
    this.request<SubscriptionControllerCancelDataContract, any>({
      path: `/api/v1/subscription/cancel`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Subscription
   * @name SubscriptionControllerReactivate
   * @request POST:/api/v1/subscription/reactivate
   */
  subscriptionControllerReactivate = (params: RequestParams = {}) =>
    this.request<SubscriptionControllerReactivateDataContract, any>({
      path: `/api/v1/subscription/reactivate`,
      method: 'POST',
      ...params,
    });
}

export const SUBSCRIPTION_QUERY_KEYS = {
  controllerCreate: 'subscriptionControllerCreate',
  controllerFindByUser: 'subscriptionControllerFindByUser',
  controllerFindOne: 'subscriptionControllerFindOne',
  controllerUpdate: 'subscriptionControllerUpdate',
  controllerRemove: 'subscriptionControllerRemove',
  controllerCancel: 'subscriptionControllerCancel',
  controllerReactivate: 'subscriptionControllerReactivate',
};

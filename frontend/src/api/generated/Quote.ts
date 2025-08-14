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
  CreateQuoteDtoContract,
  QuoteControllerCreateQuoteDataContract,
  QuoteControllerDeleteQuoteDataContract,
  QuoteControllerGetQuoteByIdDataContract,
  QuoteControllerGetQuotesByProjectIdDataContract,
  QuoteControllerUpdateQuoteDataContract,
  UpdateQuoteDtoContract,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Quote<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Quote
   * @name QuoteControllerCreateQuote
   * @request POST:/api/v1/quotes
   */
  quoteControllerCreateQuote = (
    data: CreateQuoteDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<QuoteControllerCreateQuoteDataContract, any>({
      path: `/api/v1/quotes`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Quote
   * @name QuoteControllerGetQuoteById
   * @request GET:/api/v1/quotes/{id}
   */
  quoteControllerGetQuoteById = (id: string, params: RequestParams = {}) =>
    this.request<QuoteControllerGetQuoteByIdDataContract, any>({
      path: `/api/v1/quotes/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Quote
   * @name QuoteControllerUpdateQuote
   * @request PUT:/api/v1/quotes/{id}
   */
  quoteControllerUpdateQuote = (
    id: string,
    data: UpdateQuoteDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<QuoteControllerUpdateQuoteDataContract, any>({
      path: `/api/v1/quotes/${id}`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Quote
   * @name QuoteControllerDeleteQuote
   * @request DELETE:/api/v1/quotes/{id}
   */
  quoteControllerDeleteQuote = (id: string, params: RequestParams = {}) =>
    this.request<QuoteControllerDeleteQuoteDataContract, any>({
      path: `/api/v1/quotes/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Quote
   * @name QuoteControllerGetQuotesByProjectId
   * @request GET:/api/v1/quotes/project/{projectId}
   */
  quoteControllerGetQuotesByProjectId = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<QuoteControllerGetQuotesByProjectIdDataContract, any>({
      path: `/api/v1/quotes/project/${projectId}`,
      method: 'GET',
      ...params,
    });
}

export const QUOTE_QUERY_KEYS = {
  controllerCreateQuote: 'quoteControllerCreateQuote',
  controllerGetQuoteById: 'quoteControllerGetQuoteById',
  controllerUpdateQuote: 'quoteControllerUpdateQuote',
  controllerDeleteQuote: 'quoteControllerDeleteQuote',
  controllerGetQuotesByProjectId: 'quoteControllerGetQuotesByProjectId',
};

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
  AuthControllerConfirmResetPasswordDataContract,
  AuthControllerGetUserDataContract,
  AuthControllerHandleAuthErrorDataContract,
  AuthControllerHandleAuthErrorParamsContract,
  AuthControllerHandleSsoCallbackParamsContract,
  AuthControllerHandleSsoCallbackPostDataContract,
  AuthControllerHandleSsoCallbackPostPayloadContract,
  AuthControllerLoginDataContract,
  AuthControllerRegisterDataContract,
  AuthControllerResetPasswordDataContract,
  AuthControllerResetPasswordPayloadContract,
  AuthControllerSignInWithSsoDataContract,
  AuthControllerSignOutDataContract,
  AuthControllerUpdatePasswordDataContract,
  LoginDtoContract,
  RegisterDtoContract,
  ResetPasswordConfirmDtoContract,
  SSORequestDtoContract,
  UpdatePasswordDtoContract,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Auth<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerRegister
   * @summary Register a new user
   * @request POST:/api/v1/auth/register
   */
  authControllerRegister = (
    data: RegisterDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<AuthControllerRegisterDataContract, void>({
      path: `/api/v1/auth/register`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerLogin
   * @summary Login user
   * @request POST:/api/v1/auth/login
   */
  authControllerLogin = (data: LoginDtoContract, params: RequestParams = {}) =>
    this.request<AuthControllerLoginDataContract, void>({
      path: `/api/v1/auth/login`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerSignOut
   * @summary Sign out user
   * @request POST:/api/v1/auth/signout
   * @secure
   */
  authControllerSignOut = (params: RequestParams = {}) =>
    this.request<AuthControllerSignOutDataContract, any>({
      path: `/api/v1/auth/signout`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerResetPassword
   * @summary Request password reset
   * @request POST:/api/v1/auth/reset-password
   */
  authControllerResetPassword = (
    data: AuthControllerResetPasswordPayloadContract,
    params: RequestParams = {},
  ) =>
    this.request<AuthControllerResetPasswordDataContract, void>({
      path: `/api/v1/auth/reset-password`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerConfirmResetPassword
   * @summary Confirm password reset with code
   * @request POST:/api/v1/auth/confirm-reset-password
   */
  authControllerConfirmResetPassword = (
    data: ResetPasswordConfirmDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<AuthControllerConfirmResetPasswordDataContract, void>({
      path: `/api/v1/auth/confirm-reset-password`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerUpdatePassword
   * @summary Update user password
   * @request POST:/api/v1/auth/update-password
   * @secure
   */
  authControllerUpdatePassword = (
    data: UpdatePasswordDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<AuthControllerUpdatePasswordDataContract, void>({
      path: `/api/v1/auth/update-password`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerGetUser
   * @summary Get current user
   * @request GET:/api/v1/auth/user
   * @secure
   */
  authControllerGetUser = (params: RequestParams = {}) =>
    this.request<AuthControllerGetUserDataContract, void>({
      path: `/api/v1/auth/user`,
      method: 'GET',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerSignInWithSso
   * @summary Initiate SSO authentication
   * @request POST:/api/v1/auth/sso
   */
  authControllerSignInWithSso = (
    data: SSORequestDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<AuthControllerSignInWithSsoDataContract, void>({
      path: `/api/v1/auth/sso`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerHandleSsoCallback
   * @summary Handle SSO callback with authorization code or redirect for implicit flow
   * @request GET:/api/v1/auth/sso/callback
   */
  authControllerHandleSsoCallback = (
    query: AuthControllerHandleSsoCallbackParamsContract,
    params: RequestParams = {},
  ) =>
    this.request<any, void>({
      path: `/api/v1/auth/sso/callback`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerHandleSsoCallbackPost
   * @summary Handle SSO callback with tokens from frontend (fallback for implicit flow)
   * @request POST:/api/v1/auth/sso/callback
   */
  authControllerHandleSsoCallbackPost = (
    data: AuthControllerHandleSsoCallbackPostPayloadContract,
    params: RequestParams = {},
  ) =>
    this.request<AuthControllerHandleSsoCallbackPostDataContract, any>({
      path: `/api/v1/auth/sso/callback`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerHandleAuthError
   * @summary Handle authentication errors
   * @request GET:/api/v1/auth/error
   */
  authControllerHandleAuthError = (
    query: AuthControllerHandleAuthErrorParamsContract,
    params: RequestParams = {},
  ) =>
    this.request<AuthControllerHandleAuthErrorDataContract, any>({
      path: `/api/v1/auth/error`,
      method: 'GET',
      query: query,
      ...params,
    });
}

export const AUTH_QUERY_KEYS = {
  controllerRegister: 'authControllerRegister',
  controllerLogin: 'authControllerLogin',
  controllerSignOut: 'authControllerSignOut',
  controllerResetPassword: 'authControllerResetPassword',
  controllerConfirmResetPassword: 'authControllerConfirmResetPassword',
  controllerUpdatePassword: 'authControllerUpdatePassword',
  controllerGetUser: 'authControllerGetUser',
  controllerSignInWithSso: 'authControllerSignInWithSso',
  controllerHandleSsoCallback: 'authControllerHandleSsoCallback',
  controllerHandleSsoCallbackPost: 'authControllerHandleSsoCallbackPost',
  controllerHandleAuthError: 'authControllerHandleAuthError',
};

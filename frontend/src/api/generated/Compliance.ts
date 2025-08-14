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
  ComplianceControllerHealthCheckDataContract,
  ComplianceControllerValidateGlobalWithDimensioningDataContract,
  ComplianceControllerValidateRoomEquipmentDataContract,
  RoomEquipmentValidationRequestDtoContract,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Compliance<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Validates electrical installation room equipment against NF C 15-100 standards
   *
   * @tags compliance
   * @name ComplianceControllerValidateRoomEquipment
   * @summary Validate room equipment compliance
   * @request POST:/api/v1/api/v1/compliance/validate/room-equipment
   * @secure
   */
  complianceControllerValidateRoomEquipment = (
    data: RoomEquipmentValidationRequestDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<ComplianceControllerValidateRoomEquipmentDataContract, void>({
      path: `/api/v1/api/v1/compliance/validate/room-equipment`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Validates complete electrical installation against NF C 15-100 standards and provides electrical dimensioning calculations
   *
   * @tags compliance
   * @name ComplianceControllerValidateGlobalWithDimensioning
   * @summary Validate global installation with electrical dimensioning
   * @request POST:/api/v1/api/v1/compliance/validate/global-with-dimensioning
   * @secure
   */
  complianceControllerValidateGlobalWithDimensioning = (
    data: RoomEquipmentValidationRequestDtoContract,
    params: RequestParams = {},
  ) =>
    this.request<
      ComplianceControllerValidateGlobalWithDimensioningDataContract,
      void
    >({
      path: `/api/v1/api/v1/compliance/validate/global-with-dimensioning`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Returns the health status of the compliance service and underlying compliance engine
   *
   * @tags compliance
   * @name ComplianceControllerHealthCheck
   * @summary Check compliance service health
   * @request GET:/api/v1/api/v1/compliance/health
   * @secure
   */
  complianceControllerHealthCheck = (params: RequestParams = {}) =>
    this.request<ComplianceControllerHealthCheckDataContract, void>({
      path: `/api/v1/api/v1/compliance/health`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
}

export const COMPLIANCE_QUERY_KEYS = {
  controllerValidateRoomEquipment: 'complianceControllerValidateRoomEquipment',
  controllerValidateGlobalWithDimensioning:
    'complianceControllerValidateGlobalWithDimensioning',
  controllerHealthCheck: 'complianceControllerHealthCheck',
};

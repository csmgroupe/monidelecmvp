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

export type CreateUserDtoContract = object;

export type UpdateUserDtoContract = object;

export type RegisterDtoContract = object;

export type AuthResponseDtoContract = object;

export interface LoginDtoContract {
  /**
   * User email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * User password
   * @example "password123"
   */
  password: string;
}

export interface ResetPasswordConfirmDtoContract {
  /**
   * Reset code from email link
   * @example "bf3c5078-f6e1-4540-85f3-52cad13da4cd"
   */
  code: string;
  /**
   * New password (minimum 6 characters)
   * @example "newPassword123"
   */
  newPassword: string;
}

export interface UpdatePasswordDtoContract {
  /**
   * Current password
   * @example "currentPassword123"
   */
  currentPassword: string;
  /**
   * New password (minimum 6 characters)
   * @example "newPassword123"
   */
  newPassword: string;
}

export interface SSORequestDtoContract {
  /**
   * OAuth provider
   * @example "google"
   */
  provider: 'google' | 'github' | 'azure' | 'facebook' | 'twitter' | 'apple';
  /**
   * URL to redirect to after successful authentication
   * @example "http://localhost:5173/dashboard"
   */
  redirectTo?: string;
}

export type CreateProjectDtoContract = object;

export type UpdateProjectDtoContract = object;

export type UpdateProjectRoomsDtoContract = object;

export type UpdateProjectEquipmentsDtoContract = object;

export type CreateSubscriptionDtoContract = object;

export type UpdateSubscriptionDtoContract = object;

export type CreateQuoteDtoContract = object;

export type UpdateQuoteDtoContract = object;

export interface RoomEquipmentDtoContract {
  /** Equipment type */
  equipment_type: string;
  /** Quantity of equipment */
  quantity: number;
  /** Equipment specifications */
  specifications: object;
}

export interface RoomDtoContract {
  /** Room identifier */
  room_id: string;
  /** Room type */
  room_type: string;
  /** Room area in square meters */
  room_area: number;
  /** List of equipment in the room */
  equipment: RoomEquipmentDtoContract[];
}

export interface RoomEquipmentValidationRequestDtoContract {
  /** Installation identifier */
  installation_id: string;
  /** JSON-LD context */
  '@context': object;
  /** List of rooms */
  rooms: RoomDtoContract[];
}

export interface ComplianceViolationDtoContract {
  /** Violation message */
  message: string;
  /** Suggested fix */
  suggested_fix: string;
  /** Severity level */
  severity: string;
}

export interface GlobalComplianceDtoContract {
  /** Overall compliance status */
  overall_status: string;
  /** List of violations */
  violations: ComplianceViolationDtoContract[];
}

export interface RoomResultDtoContract {
  /** Room identifier */
  room_id: string;
  /** Compliance status */
  compliance_status: string;
  /** Missing equipment */
  missing_equipment: string[];
  /** Violations */
  violations: ComplianceViolationDtoContract[];
}

export interface RoomEquipmentValidationResponseDtoContract {
  /** Installation identifier */
  installation_id: string;
  /** Global compliance */
  global_compliance: GlobalComplianceDtoContract;
  /** Room results */
  room_results: RoomResultDtoContract[];
  /** Validation timestamp */
  timestamp: string;
}

export interface CircuitBreakerDtoContract {
  /** Breaker rating in amperes */
  rating: number;
  /** Quantity needed */
  quantity: number;
  /** Description */
  description: string;
}

export interface ElectricalPanelDtoContract {
  /** Number of modules */
  modules: number;
  /** Panel type */
  type: string;
}

export interface CableDtoContract {
  /** Cable type */
  type: string;
  /** Cable section in mm² */
  section: number;
  /** Estimated length in meters */
  length_estimate: number;
}

export interface DimensioningDtoContract {
  /** Circuit breakers */
  circuit_breakers: CircuitBreakerDtoContract[];
  /** Electrical panels */
  electrical_panels: ElectricalPanelDtoContract[];
  /** Cables */
  cables: CableDtoContract[];
  /** Installation notes */
  installation_notes: string[];
}

export interface GlobalValidationWithDimensioningResponseDtoContract {
  /** Installation identifier */
  installation_id: string;
  /** Global compliance */
  global_compliance: GlobalComplianceDtoContract;
  /** Room results */
  room_results: RoomResultDtoContract[];
  /** Validation timestamp */
  timestamp: string;
  /** Electrical dimensioning */
  dimensioning: DimensioningDtoContract;
}

export type AppControllerGetHelloDataContract = any;

export type UserControllerCreateDataContract = any;

export type UserControllerFindAllDataContract = any;

export type UserControllerFindOneDataContract = any;

export type UserControllerUpdateDataContract = any;

export type UserControllerRemoveDataContract = any;

export type AuthControllerRegisterDataContract = AuthResponseDtoContract;

export type AuthControllerLoginDataContract = AuthResponseDtoContract;

export type AuthControllerSignOutDataContract = any;

export interface AuthControllerResetPasswordPayloadContract {
  /** @format email */
  email: string;
  /** @format uri */
  redirectUrl: string;
}

export type AuthControllerResetPasswordDataContract = any;

export type AuthControllerConfirmResetPasswordDataContract = any;

export type AuthControllerUpdatePasswordDataContract = any;

export type AuthControllerGetUserDataContract = any;

export type AuthControllerSignInWithSsoDataContract = any;

export interface AuthControllerHandleSsoCallbackParamsContract {
  /** Authorization code from OAuth provider */
  code?: string;
  /** Access token from implicit flow */
  access_token?: string;
  refresh_token: string;
  /** State parameter */
  state?: string;
  /** Final redirect URL */
  redirect_to?: string;
}

export interface AuthControllerHandleSsoCallbackPostPayloadContract {
  access_token?: string;
  refresh_token?: string;
  redirect_to?: string;
}

export type AuthControllerHandleSsoCallbackPostDataContract = any;

export interface AuthControllerHandleAuthErrorParamsContract {
  /** Error message */
  message?: string;
}

export type AuthControllerHandleAuthErrorDataContract = any;

export type ProjectControllerCreateDataContract = any;

export interface ProjectControllerFindAllParamsContract {
  /**
   * Page number
   * @example "1"
   */
  page?: string;
  /**
   * Number of items per page
   * @example "10"
   */
  limit?: string;
}

export type ProjectControllerFindAllDataContract = any;

export type ProjectControllerFindOneDataContract = any;

export type ProjectControllerUpdateDataContract = any;

export type ProjectControllerRemoveDataContract = any;

export type ProjectControllerUploadPlanDataContract = any;

export type ProjectControllerGetPlanUrlDataContract = any;

export interface PlanUploadControllerUploadPlanParamsContract {
  projectId: string;
}

export type PlanUploadControllerUploadPlanDataContract = any;

export type PlanUploadControllerDeletePlanDataContract = any;

export type ProjectPlansControllerUploadPlanDataContract = any;

export type ProjectPlansControllerGetPlansDataContract = any;

export type ProjectPlansControllerGetPlanDataContract = any;

export type ProjectPlansControllerDeletePlanDataContract = any;

export type ProjectPlansControllerAnalyzeAllPlansDataContract = any;

export type ProjectPlansControllerPurgeProjectDataDataContract = any;

export type AnalysisResultControllerGetLatestAnalysisResultDataContract = any;

export type AnalysisResultControllerGetAnalysisHistoryDataContract = any;

export type AnalysisResultControllerDeleteAnalysisResultDataContract = any;

export type ProjectRoomsControllerGetProjectRoomsDataContract = any;

export type ProjectRoomsControllerUpdateProjectRoomsDataContract = any;

export type ProjectEquipmentControllerGetProjectEquipmentsDataContract = any;

export type ProjectEquipmentControllerUpdateProjectEquipmentsDataContract = any;

export type SubscriptionControllerCreateDataContract = any;

export type SubscriptionControllerFindByUserDataContract = any;

export type SubscriptionControllerFindOneDataContract = any;

export type SubscriptionControllerUpdateDataContract = any;

export type SubscriptionControllerRemoveDataContract = any;

export type SubscriptionControllerCancelDataContract = any;

export type SubscriptionControllerReactivateDataContract = any;

export type QuoteControllerCreateQuoteDataContract = any;

export type QuoteControllerGetQuoteByIdDataContract = any;

export type QuoteControllerUpdateQuoteDataContract = any;

export type QuoteControllerDeleteQuoteDataContract = any;

export type QuoteControllerGetQuotesByProjectIdDataContract = any;

export type ComplianceControllerValidateRoomEquipmentDataContract =
  RoomEquipmentValidationResponseDtoContract;

export type ComplianceControllerValidateGlobalWithDimensioningDataContract =
  GlobalValidationWithDimensioningResponseDtoContract;

export interface ComplianceControllerHealthCheckDataContract {
  /** @example "healthy" */
  status?: string;
  /** @example "healthy" */
  complianceEngine?: string;
}

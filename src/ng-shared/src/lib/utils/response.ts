/**
 * Response for API calls
 */
export class Response {
  /**
   * True if web service has been successful.
   * If web service failed, check code for more specific information.
   */
  status: boolean;

  /**
   * Return code (can be error code, example "login_required", ...).
   */
  code: string;

}

/**
 * Object response from API
 */
export interface ObjectResponse<T> extends Response {
  data: T;
}

/**
 * List response from API
 */
export interface ListResponse<T> extends Response {
  data: [T];
}

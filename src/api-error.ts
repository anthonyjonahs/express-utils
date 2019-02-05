/**
 * A custom Error for rejected API requests. The connect funtion knows how to handle with this error.
 * @extends Error
 */
export default class ApiError extends Error {
  module: string;
  message: string
  statusCode: number
  info?: string

  /**
   * Instantiate an error with information about which module it represents.
   * @param {string} module The module from which error was instantiated.
   */
  constructor(module: string) {
    super();
    this.module = module;
  }

  /**
   * Create an apiError
   * @param {string} statusCode - Some stuff
   * @param {string} [message] - more stuff
   * @param {string} [info] - last stuff
   */
  with(statusCode: number, message?: string, info?: string): ApiError {
    this.statusCode = statusCode;
    this.message = message
    this.info = info;
    return this;
  }

  /**
   * Creates a 403 Forbidden error.
   * @param {string} [message] Custom message to send to user.
   * @param {string} [info] Extra information for logging.
   */
  forbidden(message?: string, info?: string) {
    return this.with(403, message, info);
  }

  /**
   * Creates a 401 Unauthorized error.
   * @param {string} [message] Custom message to send to user.
   * @param {string} [info] Extra information for logging.
   */
  unauthorized(message?: string, info?: string) {
    return this.with(401, message, info);
  }

  /**
   * Creates a 404 Not Found error.
   * @param {string} [message] Custom message to send to user.
   * @param {string} [info] Extra information for logging.
   */
  notFound(message?: string, info?: string) {
    return this.with(404, message, info);
  }
  
  /**
   * Creates a 400 Bad Request error.
   * @param {string} [message] Custom message to send to user.
   * @param {string} [info] Extra information for logging.
   */
  badRequest(message?: string, info?: string) {
    return this.with(400, message, info);
  }
}
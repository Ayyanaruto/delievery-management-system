import { APP_ERROR_MESSAGE, HttpStatusCode } from "../constants/constant";

export class BaseError extends Error {
  public override readonly name: string;
  public readonly httpCode: HttpStatusCode;

  constructor(name: string, httpCode: HttpStatusCode, description: string) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.httpCode = httpCode;
    this.name = name;

    Error.captureStackTrace(this);
  }
}

export class GenericServerError extends BaseError {
  constructor(description = APP_ERROR_MESSAGE.serverError) {
    super("SERVER_ERROR", HttpStatusCode.SERVER_ERROR, description);
  }
}

export class BadRequestError extends BaseError {
  constructor(description = APP_ERROR_MESSAGE.badRequest) {
    super("BAD_REQUEST", HttpStatusCode.BAD_REQUEST, description);
  }
}

export class NotFoundError extends BaseError {
  constructor(description = APP_ERROR_MESSAGE.notFound) {
    super("NOT_FOUND", HttpStatusCode.NOT_FOUND, description);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(description = APP_ERROR_MESSAGE.unauthorized) {
    super("UNAUTHORIZED", HttpStatusCode.UNAUTHORIZED, description);
  }
}

export class ForbiddenError extends BaseError {
  constructor(description = APP_ERROR_MESSAGE.forbidden) {
    super("FORBIDDEN", HttpStatusCode.FORBIDDEN, description);
  }
}

export class ValidationError extends BaseError {
  constructor(description = APP_ERROR_MESSAGE.validationError) {
    super("VALIDATION_ERROR", HttpStatusCode.UNPROCESSABLE_ENTITY, description);
  }
}

export class ConflictError extends BaseError {
  constructor(description = APP_ERROR_MESSAGE.conflictError) {
    super("CONFLICT", HttpStatusCode.CONFLICT, description);
  }
}

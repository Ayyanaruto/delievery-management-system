
export const enum HttpStatusCode {
  NOT_FOUND = 404,
  CREATED = 201,
  CONFLICT = 409,
  BAD_REQUEST = 400,
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  SERVER_ERROR = 500,
  UNPROCESSABLE_ENTITY = 422
}

export const APP_ERROR_MESSAGE = {
    serverError: "Something went wrong, try again later",
    badRequest: "Bad request, please check your input",
    unauthorized: "Unauthorized access, please login",
    forbidden: "You don't have permission to access this resource",
    validationError: "Validation failed, please check your credentials",
    conflictError: "Resource already exists or conflict detected",
    notFound: "Resource not found",
    unprocessableEntity: "Unable to process the request due to invalid data",
};

export const enum ROLE {
  ADMIN = "ADMIN",
  PARTNER = "PARTNER",
}
export  enum DELIVERY_PARTNER_STATUS {
  AVAILABLE = "AVAILABLE",
  OFFLINE = "OFFLINE",
  ON_BREAK = "ON_BREAK",
  ON_DELIVERY = "ON_DELIVERY",
  ASSIGNED = "ASSIGNED"
}

export const enum VALIDATION_ERROR_MESSAGE {
  REQUIRED_NAME = "Please enter a name.",
  REQUIRED_EMAIL = "Please enter an email address.",
  REQUIRED_PASSWORD = "Please enter a password.",
  REQUIRED_PHONE = "Please enter a phone number.",

  INVALID_EMAIL = "Please enter a valid email address.",
  INVALID_PASSWORD = "Password must be at least 6 characters long.",
  INVALID_PHONE = "Please enter a valid 10-digit phone number.",

  INVALID_COORDINATES ="Coordinates must contain exactly 2 values [longitude, latitude]"
}

export enum ConsoleColor {
  RESET = "\x1b[0m",
}

export enum MethodColor {
  GET = "\x1b[32m",
  POST = "\x1b[34m",
  PUT = "\x1b[33m",
  DELETE = "\x1b[31m",
}

export enum StatusColor {
  SUCCESS = "\x1b[32m",
  REDIRECT = "\x1b[36m",
  CLIENT_ERROR = "\x1b[33m",
  SERVER_ERROR = "\x1b[31m",
}

export enum ElementColor {
  URL = "\x1b[36m",
  TIME = "\x1b[35m",
  SIZE = "\x1b[90m",
}

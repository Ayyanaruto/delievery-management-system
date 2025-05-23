import type { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";
import { BaseError, GenericServerError } from "../lib/error";
import { HttpStatusCode } from "../constants/constant";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error("Something went wrong ", {
    message: err.message,
    stack: err.stack,
  });

  if (err instanceof BaseError) {
    res.status(err.httpCode).json({
      status: "error",
      statusCode: err.httpCode,
      message: err.message,
      name: err.name,
    });
    return;
  }

  const serverError = new GenericServerError();
  res.status(HttpStatusCode.SERVER_ERROR).json({
    status: "error",
    statusCode: HttpStatusCode.SERVER_ERROR,
    message: serverError.message,
    name: serverError.name,
  });
};

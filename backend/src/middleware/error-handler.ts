import type { NextFunction, Request, Response } from "express";
import { AiProviderError } from "../ai/errors.js";
import { HttpError, RequestValidationError } from "../errors.js";
import { getRequestContext } from "./request-context.js";
import { logError, sanitizeErrorDetails, type StructuredLogEntry } from "../logging/logger.js";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, "Route not found"));
}

function buildErrorLogEntry(
  request: Request,
  response: Response,
  error: unknown,
): StructuredLogEntry {
  const { requestId, path } = getRequestContext(request, response);

  if (error instanceof AiProviderError) {
    return {
      event: "ai.provider.failure",
      requestId,
      method: request.method,
      path,
      statusCode: error.statusCode,
      message: error.message,
      error: {
        name: error.name,
        kind: error.kind,
        message: error.message,
        details: sanitizeErrorDetails(error.details),
      },
    };
  }

  if (error instanceof RequestValidationError) {
    return {
      event: "request.validation_failed",
      requestId,
      method: request.method,
      path,
      statusCode: error.statusCode,
      message: error.message,
      error: {
        name: error.name,
        fields: error.fields,
      },
    };
  }

  if (error instanceof HttpError) {
    return {
      event: "request.error",
      requestId,
      method: request.method,
      path,
      statusCode: error.statusCode,
      message: error.message,
      error: {
        name: error.name,
        message: error.message,
      },
    };
  }

  const message = error instanceof Error ? error.message : "Unknown error";

  return {
    event: "request.error",
    requestId,
    method: request.method,
    path,
    statusCode: 500,
    message,
    error: {
      name: error instanceof Error ? error.name : "UnknownError",
      message,
    },
  };
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logError(buildErrorLogEntry(req, res, error));

  if (error instanceof RequestValidationError) {
    return res.status(error.statusCode).json({
      error: error.message,
      fields: error.fields,
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  return res.status(500).json({
    error: "Internal server error",
  });
}

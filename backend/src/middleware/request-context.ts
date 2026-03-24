import { randomUUID } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { logInfo } from "../logging/logger.js";

const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

function readIncomingRequestId(request: Request): string | null {
  const value = request.header(REQUEST_ID_HEADER);

  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return REQUEST_ID_PATTERN.test(trimmed) ? trimmed : null;
}

function getRequestId(request: Request): string {
  return readIncomingRequestId(request) ?? randomUUID();
}

function getRequestPath(request: Request): string {
  return request.originalUrl ?? request.url ?? request.path;
}

export const requestContextMiddleware: RequestHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const path = getRequestPath(request);

  response.locals.requestId = requestId;
  response.setHeader(REQUEST_ID_HEADER, requestId);

  response.on("finish", () => {
    logInfo({
      event: "request.completed",
      requestId,
      method: request.method,
      path,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
};

export function getRequestContext(request: Request, response: Response) {
  return {
    requestId: response.locals?.requestId as string | undefined,
    path: getRequestPath(request),
  };
}

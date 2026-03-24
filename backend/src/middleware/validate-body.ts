import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";
import { RequestValidationError, type ValidationIssue } from "../errors.js";

function formatPath(path: Array<string | number>): string {
  return path.reduce<string>((acc, segment) => {
    if (typeof segment === "number") {
      return `${acc}[${segment}]`;
    }

    return acc.length > 0 ? `${acc}.${segment}` : segment;
  }, "");
}

function toValidationIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    field: formatPath(
      issue.path.filter(
        (segment): segment is string | number =>
          typeof segment === "string" || typeof segment === "number",
      ),
    ),
    message: issue.message,
  }));
}

export function validateBody<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return next(new RequestValidationError(toValidationIssues(parsed.error)));
    }

    req.body = parsed.data;
    return next();
  };
}

export { toValidationIssues };

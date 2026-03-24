export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export class RequestValidationError extends HttpError {
  fields: ValidationIssue[];

  constructor(fields: ValidationIssue[]) {
    super(400, "Validation failed");
    this.name = "RequestValidationError";
    this.fields = fields;
  }
}

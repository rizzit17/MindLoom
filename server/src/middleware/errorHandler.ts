import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: string[]
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, details?: string[]) {
    super(400, message, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message: string, details?: string[]) {
    super(422, message, details);
  }
}

export class BadGatewayError extends HttpError {
  constructor(message: string, details?: string[]) {
    super(502, message, details);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.message, err);

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Invalid request payload',
      details: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
  });
};

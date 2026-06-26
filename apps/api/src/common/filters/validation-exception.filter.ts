import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { createErrorResponse } from '../utils';

interface ValidationError {
  field: string;
  constraints: string[];
}

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (this.isValidationException(exception)) {
      const errors = this.formatErrors(exception);
      const body = createErrorResponse(
        HttpStatus.BAD_REQUEST,
        'Validation failed',
        errors,
        request.url,
      );
      response.status(HttpStatus.BAD_REQUEST).json(body);
      return;
    }

    throw exception;
  }

  private isValidationException(exception: unknown): exception is { errors: ValidationError[] } {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'errors' in exception &&
      Array.isArray((exception as { errors: unknown }).errors)
    );
  }

  private formatErrors(exception: { errors: ValidationError[] }): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    for (const error of exception.errors) {
      errors[error.field] = error.constraints;
    }
    return errors;
  }
}

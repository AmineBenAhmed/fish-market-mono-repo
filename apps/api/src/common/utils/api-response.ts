import { HttpStatus } from '@nestjs/common';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
  path?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  path?: string,
): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (meta) response.meta = meta;
  if (path) response.path = path;

  return response;
}

export function createErrorResponse(
  statusCode: HttpStatus,
  message: string,
  errors?: Record<string, string[]>,
  path?: string,
): ApiErrorResponse {
  const response: ApiErrorResponse = {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) response.errors = errors;
  if (path) response.path = path;

  return response;
}

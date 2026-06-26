import { Request } from 'express';

import { JwtPayload } from './jwt-payload.interface';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type { ApiResponseWrapper, PaginatedResponse } from './api-response.interface';
export type { JwtPayload, TokenPair } from './jwt-payload.interface';

import { PAGINATION_DEFAULTS } from '../constants';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function parsePagination(page?: number, limit?: number): PaginationParams {
  const safePage = Math.max(1, page ?? PAGINATION_DEFAULTS.page);
  const safeLimit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(1, limit ?? PAGINATION_DEFAULTS.limit),
  );

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function createPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

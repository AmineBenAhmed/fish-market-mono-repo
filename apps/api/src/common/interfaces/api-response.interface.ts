export interface ApiResponseWrapper<T = unknown> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

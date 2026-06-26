export const API_PREFIX = 'api/v1';
export const API_DOCS_PATH = 'api/docs';

export const CORS_ORIGIN = process.env.APP_URL || 'http://localhost:3000';
export const DEFAULT_PORT = 4000;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

export const RATE_LIMIT_TTL = 60000;
export const RATE_LIMIT_MAX = 100;

export const REQUEST_TIMEOUT = 30000;

export const SWAGGER_TITLE = 'FishMarket API';
export const SWAGGER_DESCRIPTION = 'Marketplace API for fresh fish sales';
export const SWAGGER_VERSION = '1.0';
export const SWAGGER_BEARER_NAME = 'access-token';

export const HEADER_REQUEST_ID = 'x-request-id';
export const HEADER_CORRELATION_ID = 'x-correlation-id';

export const LOGGER_CONTEXT_BOOTSTRAP = 'Bootstrap';
export const LOGGER_CONTEXT_HTTP = 'HTTP';
export const LOGGER_CONTEXT_DATABASE = 'Database';
export const LOGGER_CONTEXT_CACHE = 'Cache';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

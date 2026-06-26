export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  avatarFileId: string | null;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

import { UserPayload } from "../users/users.types"

export interface JwtPayload {
    sub: string;
    email: string;
    username: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface JwtRefreshPayload extends JwtPayload {
    refreshToken: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    user: UserPayload;
    tokens: AuthTokens;
}

export interface GoogleProfile {
    id: string;
    email: string;
    username: string;
    avatar: string;
}

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error: string;
}
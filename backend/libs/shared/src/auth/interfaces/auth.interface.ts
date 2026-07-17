import { UserPayload } from '../../users/interfaces/user.interface'

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    user: UserPayload;
    tokens: AuthTokens;
}

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  username: string;
  registeredViaGoogle: boolean;
}

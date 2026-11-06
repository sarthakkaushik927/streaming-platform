export interface User {
  id: string;
  username: string;
  email?: string;
  emailAddress?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RawAuthResponse {
  token?: string;
  accessToken?: string;
  user?: User;
  data?: {
    token?: string;
    accessToken?: string;
    user?: User;
    id?: string;
    username?: string;
    emailAddress?: string;
  };
  id?: string;
}

export interface LoginPayload {
  emailAddress: string;
  password?: string;
}

export interface RegisterPayload {
  username: string;
  emailAddress: string;
  password?: string;
  otp: string;
}

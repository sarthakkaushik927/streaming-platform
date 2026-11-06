import { LoginPayload, RegisterPayload, AuthResponse, RawAuthResponse, User } from '../types/user';
import { apiClient } from './api.client';
import { setCookie, getCookie, deleteCookie } from '../utils/cookie';

class AuthService {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<RawAuthResponse>('/auth/login', payload);
    const token = res.token || res.accessToken || res.data?.token || res.data?.accessToken;
    if (token) {
      setCookie('syncstream-token', token, 7);
      localStorage.setItem('syncstream-token', token);
    }
    const user = res.user || res.data?.user || {
      id: res.id || res.data?.id || 'u-' + Date.now(),
      username: res.data?.username || payload.emailAddress.split('@')[0],
      emailAddress: payload.emailAddress,
    };
    return { token: token || '', user };
  }

  async sendOtp(emailAddress: string): Promise<void> {
    await apiClient.post('/auth/send-otp', { emailAddress });
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<RawAuthResponse>('/auth/signup', payload);
    const user = res.user || res.data?.user || {
      id: res.id || res.data?.id || 'u-' + Date.now(),
      username: payload.username,
      emailAddress: payload.emailAddress,
    };
    return { token: '', user };
  }

  logout(): void {
    deleteCookie('syncstream-token');
    localStorage.removeItem('syncstream-token');
  }

  async getCurrentUser(): Promise<User | null> {
    const token = getCookie('syncstream-token') || localStorage.getItem('syncstream-token');
    if (!token) return null;

    try {
      const res: any = await apiClient.get<User>('/auth/me');
      if (res) {
        const resolvedUser = res.user || res.data?.user || res.data || res;
        if (!resolvedUser.id && resolvedUser._id) {
          resolvedUser.id = resolvedUser._id;
        }
        return resolvedUser;
      }
    } catch (err) {
      console.warn('Backend /auth/me call failed:', err);
    }

    return null;
  }
}

export const authService = new AuthService();

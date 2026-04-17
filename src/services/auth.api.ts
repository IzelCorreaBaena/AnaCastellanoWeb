import { http } from './http';
import type { Admin } from '@app-types/models';

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export const authApi = {
  /**
   * Authenticate with email + password.
   * Backend returns { token, admin: { id, username, email } }.
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await http.post<LoginResponse>('/auth/login', { email, password });
    return data;
  },

  /**
   * Returns the currently authenticated admin (requires Bearer token).
   */
  async me(): Promise<Admin> {
    const { data } = await http.get<Admin>('/auth/me');
    return data;
  },
};

import { apiFetch } from '@/lib/api/client';

export interface LoginResponse {
  accessToken: string;
}

export function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    auth: false,
  });
}

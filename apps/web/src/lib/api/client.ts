import { getToken } from '@/lib/auth/token';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  { auth = true, headers, ...options }: ApiFetchOptions = {},
): Promise<T> {
  const token = auth ? getToken() : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

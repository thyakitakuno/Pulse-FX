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
  redirectOn401?: boolean;
}

export async function apiFetch<T>(
  path: string,
  { redirectOn401 = true, headers, ...options }: ApiFetchOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    if (redirectOn401 && response.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    throw new ApiError(`Request to ${path} failed`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

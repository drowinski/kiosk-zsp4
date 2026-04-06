const TOKEN_KEY = 'auth-token';

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export interface AuthToken {
  sub: string;
  roles: string[];
  exp: Date;
  iat?: Date;
  iss?: string;
}

export function decodeAuthToken(token: string | null): AuthToken | null {
  if (!token) {
    return null;
  }

  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    const payloadString = atob(
      payloadBase64.replace(/-/g, '+').replace(/_/g, '/'),
    );
    const payloadRaw = JSON.parse(payloadString) as unknown as AuthToken & {
      exp: number;
      iat?: number;
    };

    return {
      ...payloadRaw,
      exp: new Date(payloadRaw.exp * 1000),
      iat: payloadRaw.iat ? new Date(payloadRaw.iat * 1000) : undefined,
    };
  } catch {
    return null;
  }
}

import { type PropsWithChildren, type ReactNode, useMemo } from 'react';
import {
  type Auth,
  AuthContext,
} from '@kiosk-zsp4/shared/features/auth/contexts/auth-context';
import { useAuthenticatedUser } from '@kiosk-zsp4/shared/features/users/api/get-authenticated-user';

export interface AuthUserProviderProps extends PropsWithChildren {
  unauthorizedFallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function AuthProvider({
  unauthorizedFallback,
  loadingFallback,
  children,
}: AuthUserProviderProps) {
  const { data: user, isSuccess, isLoading } = useAuthenticatedUser();
  const isAuthenticated = isSuccess && user !== undefined;
  const auth = useMemo<Auth | null>(
    () =>
      user
        ? {
            user: user,
          }
        : null,
    [user],
  );

  if (isLoading) {
    return loadingFallback ?? null;
  }

  if (!isAuthenticated || !auth) {
    return unauthorizedFallback ?? null;
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

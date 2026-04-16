import { type PropsWithChildren } from 'react';
import { DefaultQueryClientProvider } from '@kiosk-zsp4/shared/lib/default-query-client-provider';
import { AuthProvider } from '@kiosk-zsp4/shared/features/auth/providers/auth-provider';
import { UnauthorizedFallback } from '@/app/auth/unauthorized-fallback';

export interface AppProvidersProps extends PropsWithChildren {}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <DefaultQueryClientProvider>
      <AuthProvider unauthorizedFallback={<UnauthorizedFallback />}>
        {children}
      </AuthProvider>
    </DefaultQueryClientProvider>
  );
}

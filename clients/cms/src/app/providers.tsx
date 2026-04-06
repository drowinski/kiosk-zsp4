import { type PropsWithChildren } from 'react';
import { AuthProvider } from '@kiosk-zsp4/shared/features/auth/providers/auth-provider';
import { LoginPage } from '@/app/auth/login-page';
import { DefaultQueryClientProvider } from '@kiosk-zsp4/shared/lib/default-query-client-provider';

export interface AppProvidersProps extends PropsWithChildren {}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <DefaultQueryClientProvider>
      <AuthProvider unauthorizedFallback={<LoginPage />}>{children}</AuthProvider>
    </DefaultQueryClientProvider>
  );
}

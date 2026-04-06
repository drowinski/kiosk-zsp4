import { useContext } from 'react';
import { AuthContext } from '@kiosk-zsp4/shared/features/auth/contexts/auth-context';

export function useAuth() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('useAuth must be used within AuthContextProvider');
  }

  return auth;
}

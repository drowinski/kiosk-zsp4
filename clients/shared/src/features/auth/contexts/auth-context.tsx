import { createContext } from 'react';
import type { User } from '@kiosk-zsp4/shared/types/api';

export interface Auth {
  user: User;
}

export const AuthContext = createContext<Auth | null>(null);

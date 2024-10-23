import { Session } from '@/features/sessions/sessions.validation';
import { User } from '@/features/users/users.validation';

export type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };

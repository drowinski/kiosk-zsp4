import crypto from 'node:crypto';
import { SessionRepository, sessionRepository } from '@/features/sessions/sessions.repository';
import { Session } from '@/features/sessions/sessions.validation';
import { SessionValidationResult } from '@/features/sessions/sessions.types';

export class SessionsService {
  private readonly sessionsRepository: SessionRepository;

  constructor(sessionsRepository: SessionRepository) {
    this.sessionsRepository = sessionsRepository;
  }

  generateSessionToken(): string {
    return crypto.randomUUID();
  }

  async createSession(token: string, userId: number, expiresAt?: Date): Promise<Session> {
    const sessionId = crypto.createHash('sha256').update(token).digest('hex');
    const session = await this.sessionsRepository.createSession({
      id: sessionId,
      userId: userId,
      expiresAt: expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });
    if (!session) {
      throw new Error("Couldn't create session.");
    }
    return session;
  }

  async validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = crypto.createHash('sha256').update(token).digest('hex');
    const sessionWithUser = await this.sessionsRepository.getSessionWithUserBySessionId(sessionId);
    if (!sessionWithUser) {
      return { session: null, user: null };
    }
    const { session, user } = sessionWithUser;
    if (Date.now() >= session.expiresAt.getTime()) {
      await this.sessionsRepository.deleteSessionById(sessionId);
      return { session: null, user: null };
    }
    // TODO: Refresh session if close to expiry
    return { session, user };
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.sessionsRepository.deleteSessionById(sessionId);
  }
}

export const sessionService = new SessionsService(sessionRepository);

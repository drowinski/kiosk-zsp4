import crypto from 'node:crypto';
import { SessionRepository, sessionRepository } from '@/features/sessions/.server/sessions.repository';
import { Session } from '@/features/sessions/sessions.schemas';

export class SessionService {
  private readonly sessionsRepository: SessionRepository;

  constructor(sessionsRepository: SessionRepository) {
    this.sessionsRepository = sessionsRepository;
  }

  generateSessionToken(): string {
    return crypto.randomUUID();
  }

  async createSession(token: string, userId: number, expiresAt?: Date): Promise<Session> {
    const sessionId = this.generateSessionId(token);
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

  async validateSessionToken(token: string): Promise<Session | null> {
    const sessionId = this.generateSessionId(token);
    const session = await this.sessionsRepository.getSessionById(sessionId);
    if (!session) {
      return null;
    }
    if (Date.now() >= session.expiresAt.getTime()) {
      await this.sessionsRepository.deleteSessionById(sessionId);
      return null;
    }
    // TODO: Refresh session if close to expiry
    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.sessionsRepository.deleteSessionById(sessionId);
  }

  private generateSessionId(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const sessionService: Readonly<SessionService> = Object.freeze(new SessionService(sessionRepository));

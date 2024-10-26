import { sessionService } from '@/features/sessions/sessions.service';
import { createSessionStorage } from '@remix-run/node';
import { IS_PRODUCTION_ENV } from '@/lib/env';

type SessionData = {
  userId: number;
};

export const sessionStorage = createSessionStorage<SessionData, SessionData>({
  async createData(data: Partial<SessionData>, expiresAt): Promise<string> {
    if (!data.userId) {
      throw new Error('NO USER ID');
    }
    const token: string = sessionService.generateSessionToken();
    await sessionService.createSession(token, data.userId, expiresAt);
    return token;
  },
  async readData(token: string): Promise<SessionData | null> {
    const { session, user } = await sessionService.validateSessionToken(token);
    if (!session || !user) {
      return null;
    }
    return { userId: session.userId };
  },
  async updateData(id, data, expires) {
    console.log('Session storage, updateData', id, data, expires); // TODO
  },
  async deleteData(token: string) {
    await sessionService.invalidateSession(token);
  },
  cookie: {
    name: '__session',
    httpOnly: true,
    // KEEP MAX AGE (EXPIRES ONLY SET AT SERVER STARTUP)
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    secrets: ['s3cret1'],
    secure: IS_PRODUCTION_ENV
  }
});

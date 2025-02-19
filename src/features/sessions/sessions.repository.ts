import { NewSession, Session } from '@/features/sessions/sessions.validation';
import { User } from '@/features/users/users.validation';
import { db } from '@/lib/db/connection';
import { sessionTable } from '@/features/sessions/sessions.db';
import { userTable } from '@/features/users/users.db';
import { eq } from 'drizzle-orm';

export interface SessionRepository {
  createSession(values: NewSession): Promise<Session | null>;

  getSessionWithUserBySessionId(id: string): Promise<{ session: Session; user: User } | null>;

  deleteSessionById(id: string): Promise<Session | null>;
}

export class DrizzleSessionRepository implements SessionRepository {
  async createSession(values: NewSession): Promise<Session | null> {
    const result = await db.insert(sessionTable).values(values).returning();
    return result.at(0) ?? null;
  }

  async getSessionWithUserBySessionId(id: string): Promise<{ session: Session; user: User } | null> {
    const result = await db
      .select({
        session: sessionTable,
        user: userTable
      })
      .from(sessionTable)
      .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
      .where(eq(sessionTable.id, id));

    return result.at(0) ?? null;
  }

  async deleteSessionById(id: string): Promise<Session | null> {
    const result = await db.delete(sessionTable).where(eq(sessionTable.id, id)).returning();
    return result.at(0) ?? null;
  }
}

export const sessionRepository: Readonly<SessionRepository> = Object.freeze(new DrizzleSessionRepository());

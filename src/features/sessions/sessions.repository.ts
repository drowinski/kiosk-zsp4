import { NewSession, Session } from '@/features/sessions/sessions.validation';
import { db } from '@/lib/db/connection';
import { sessionTable } from '@/features/sessions/sessions.db';
import { userTable } from '@/features/users/users.db';
import { eq, getTableColumns } from 'drizzle-orm';
import { getColumns } from '@/lib/db/helpers/get-columns';

export interface SessionRepository {
  getSessionById(id: string): Promise<Session | null>;

  createSession(values: NewSession): Promise<Session | null>;

  deleteSessionById(id: string): Promise<Session | null>;
}

export class DrizzleSessionRepository implements SessionRepository {
  async getSessionById(id: string): Promise<Session | null> {
    const result = await db
      .select({
        ...getTableColumns(sessionTable),
        user: getTableColumns(userTable)
      })
      .from(sessionTable)
      .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
      .where(eq(sessionTable.id, id));

    return result.at(0) ?? null;
  }

  async createSession(values: NewSession): Promise<Session | null> {
    const insertSession = db.$with('insert_session').as(db.insert(sessionTable).values(values).returning());

    const { passwordHash: _, ...safeUserColumns } = getTableColumns(userTable);

    const result = await db
      .with(insertSession)
      .select({
        ...getColumns(insertSession),
        user: safeUserColumns
      })
      .from(insertSession)
      .innerJoin(userTable, eq(insertSession.userId, userTable.id));
    console.log(result);

    return result.at(0) ?? null;
  }

  async deleteSessionById(id: string): Promise<Session | null> {
    const deleteSession = db
      .$with('delete_session')
      .as(db.delete(sessionTable).where(eq(sessionTable.id, id)).returning());

    const { passwordHash: _, ...safeUserColumns } = getTableColumns(userTable);

    const result = await db
      .with(deleteSession)
      .select({
        ...getColumns(deleteSession),
        user: safeUserColumns
      })
      .from(deleteSession)
      .innerJoin(userTable, eq(deleteSession.userId, userTable.id));

    return result.at(0) ?? null;
  }
}

export const sessionRepository: Readonly<SessionRepository> = Object.freeze(new DrizzleSessionRepository());

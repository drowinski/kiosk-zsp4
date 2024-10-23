import { NewUser, User, UserWithPasswordHash } from '@/features/users/users.validation';
import { db } from '@/lib/db/connection';
import { userTable } from '@/features/users/users.db';
import { eq } from 'drizzle-orm';

export interface UserRepository {
  getUserById(id: number): Promise<User | null>;

  getUserWithPasswordHashByEmail(email: string): Promise<UserWithPasswordHash | null>;

  createUser(newUser: NewUser): Promise<User | null>;

  updateUser(id: number, values: Partial<UserWithPasswordHash>): Promise<User | null>;
}

export class DrizzleUserRepository implements UserRepository {
  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(userTable).where(eq(userTable.id, id));
    return result.at(0) ?? null;
  }

  async getUserWithPasswordHashByEmail(email: string): Promise<UserWithPasswordHash | null> {
    const result = await db.select().from(userTable).where(eq(userTable.email, email));
    return result.at(0) ?? null;
  }

  async createUser(newUser: NewUser): Promise<User | null> {
    const result = await db.insert(userTable).values(newUser).returning();
    return result.at(0) ?? null;
  }

  async updateUser(id: number, values: Partial<UserWithPasswordHash>): Promise<User | null> {
    const result = await db.update(userTable).set(values).where(eq(userTable.id, id)).returning();
    return result.at(0) ?? null;
  }
}

export const userRepository: Readonly<UserRepository> = Object.freeze(new DrizzleUserRepository());

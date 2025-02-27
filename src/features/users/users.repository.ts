import { NewUser, User, UserWithPasswordHash } from '@/features/users/users.validation';
import { db } from '@/lib/db/connection';
import { userTable } from '@/features/users/users.db';
import { eq, getTableColumns } from 'drizzle-orm';

export interface UserRepository {
  getUserById(id: number): Promise<User | null>;

  getUserWithPasswordHashByUsername(username: string): Promise<UserWithPasswordHash | null>;

  getAllUsers(): Promise<User[]>;

  createUser(newUser: NewUser): Promise<User | null>;

  updateUser(id: number, values: Partial<UserWithPasswordHash>): Promise<User | null>;
}

export class DrizzleUserRepository implements UserRepository {
  private readonly columnsWithoutPasswordHash: Omit<(typeof userTable)['_']['columns'], 'passwordHash'>;

  constructor() {
    const { passwordHash: _, ...columnsWithoutPasswordHash } = getTableColumns(userTable);
    this.columnsWithoutPasswordHash = columnsWithoutPasswordHash;
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await db.select(this.columnsWithoutPasswordHash).from(userTable).where(eq(userTable.id, id));
    return result.at(0) ?? null;
  }

  async getUserWithPasswordHashByUsername(username: string): Promise<UserWithPasswordHash | null> {
    const result = await db.select().from(userTable).where(eq(userTable.username, username));
    return result.at(0) ?? null;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select(this.columnsWithoutPasswordHash).from(userTable);
  }

  async createUser(newUser: NewUser): Promise<User | null> {
    const result = await db.insert(userTable).values(newUser).returning(this.columnsWithoutPasswordHash);
    return result.at(0) ?? null;
  }

  async updateUser(id: number, values: Partial<User>): Promise<User | null> {
    const result = await db
      .update(userTable)
      .set(values)
      .where(eq(userTable.id, id))
      .returning(this.columnsWithoutPasswordHash);
    return result.at(0) ?? null;
  }
}

export const userRepository: Readonly<UserRepository> = Object.freeze(new DrizzleUserRepository());

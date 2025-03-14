import { NewTag, Tag, UpdatedTag } from '@/features/tags/tags.validation';
import { db } from '@/lib/db/connection';
import { tagTable } from '@/features/tags/tags.db';
import { eq } from 'drizzle-orm';

export interface TagRepository {
  getAllTags(): Promise<Tag[]>;

  createTag(newTag: NewTag): Promise<Tag | null>;

  updateTag(updatedTag: UpdatedTag): Promise<Tag | null>;

  deleteTag(id: number): Promise<Tag | null>;
}

export class DrizzleTagRepository implements TagRepository {
  async getAllTags(): Promise<Tag[]> {
    return db.select().from(tagTable).orderBy(tagTable.name);
  }

  async createTag(newTag: NewTag): Promise<Tag | null> {
    const result = await db.insert(tagTable).values(newTag).returning();
    return result.at(0) ?? null;
  }

  async updateTag(updatedTag: UpdatedTag): Promise<Tag | null> {
    const { id, ...values } = updatedTag;
    const result = await db.update(tagTable).set(values).where(eq(tagTable.id, id)).returning();
    return result.at(0) ?? null;
  }

  async deleteTag(id: number): Promise<Tag | null> {
    const result = await db.delete(tagTable).where(eq(tagTable.id, id)).returning();
    return result.at(0) ?? null;
  }
}

export const tagRepository: Readonly<TagRepository> = Object.freeze(new DrizzleTagRepository());

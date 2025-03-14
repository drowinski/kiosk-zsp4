import { NewTag, Tag } from '@/features/tags/tags.validation';
import { db } from '@/lib/db/connection';
import { tagTable } from '@/features/tags/tags.db';

export interface TagRepository {
  getAllTags(): Promise<Tag[]>;

  createTag(tag: NewTag): Promise<Tag | null>;
}

export class DrizzleTagRepository implements TagRepository {
  async getAllTags(): Promise<Tag[]> {
    return db.select().from(tagTable).orderBy(tagTable.name);
  }

  async createTag(tag: NewTag): Promise<Tag | null> {
    const result = await db.insert(tagTable).values(tag).returning();
    return result.at(0) ?? null;
  }
}

export const tagRepository: Readonly<TagRepository> = Object.freeze(new DrizzleTagRepository());

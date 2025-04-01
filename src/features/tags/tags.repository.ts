import { NewTag, Tag, UpdatedTag } from '@/features/tags/tags.validation';
import { db } from '@/lib/db/connection';
import { assetTagJunctionTable, tagTable } from '@/features/tags/tags.db';
import { and, eq, inArray } from 'drizzle-orm';

export interface TagRepository {
  getTagById(id: number): Promise<Tag | null>;

  getAllTags(): Promise<Tag[]>;

  createTag(newTag: NewTag): Promise<Tag | null>;

  updateTag(updatedTag: UpdatedTag): Promise<Tag | null>;

  deleteTag(id: number): Promise<Tag | null>;

  addTagToAssets(tagId: number, ...assetIds: number[]): Promise<void>;

  removeTagFromAssets(tagId: number, ...assetIds: number[]): Promise<void>;
}

export class DrizzleTagRepository implements TagRepository {
  async getTagById(id: number): Promise<Tag | null> {
    const result = await db.select().from(tagTable).where(eq(tagTable.id, id));
    return result.at(0) ?? null;
  }

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

  async addTagToAssets(tagId: number, ...assetIds: number[]): Promise<void> {
    await db
      .insert(assetTagJunctionTable)
      .values(
        assetIds.map((assetId) => ({
          tagId,
          assetId
        }))
      )
      .onConflictDoNothing();
  }

  async removeTagFromAssets(tagId: number, ...assetIds: number[]): Promise<void> {
    await db
      .delete(assetTagJunctionTable)
      .where(and(eq(assetTagJunctionTable.tagId, tagId), inArray(assetTagJunctionTable.assetId, assetIds)));
  }
}

export const tagRepository: Readonly<TagRepository> = Object.freeze(new DrizzleTagRepository());

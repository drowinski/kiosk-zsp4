import { NewTimelineRange, TimelineRange, UpdatedTimelineRange } from '@/features/timeline/timeline.schemas';
import { db } from '@/lib/.server/db/connection';
import { timelineRangeTable } from '@/features/timeline/.server/timeline.db';
import { and, asc, eq, exists, getTableColumns, isNotNull, sql } from 'drizzle-orm';
import { assetTable, dateTable } from '@/features/assets/.server/assets.db';
import { Asset } from '@/features/assets/assets.schemas';
import { assetTagJunctionTable, tagTable } from '@/features/tags/.server/tags.db';
import { Tag } from '@/features/tags/tags.schemas';

export interface TimelineRepository {
  getTimelineRangeById(id: number): Promise<TimelineRange | null>;

  getAllTimelineRanges(): Promise<TimelineRange[]>;

  getAssetsByTimelineRangeId(id: number, tagId?: number): Promise<Asset[]>;

  getUniqueTagsByTimelineRangeId(id: number): Promise<Tag[]>;

  createTimelineRange(newTimelineRange: NewTimelineRange): Promise<number | null>;

  updateTimelineRange(updatedTimelineRange: UpdatedTimelineRange): Promise<void>;

  deleteTimelineRange(id: number): Promise<void>;
}

export class DrizzleTimelineRepository implements TimelineRepository {
  async getTimelineRangeById(id: number): Promise<TimelineRange | null> {
    const timelineRanges = await db
      .select({
        ...getTableColumns(timelineRangeTable),
        coverAsset: {
          ...getTableColumns(assetTable)
        }
      })
      .from(timelineRangeTable)
      .leftJoin(assetTable, eq(assetTable.id, timelineRangeTable.coverAssetId))
      .where(eq(timelineRangeTable.id, id));
    return timelineRanges.at(0) ?? null;
  }

  async getAllTimelineRanges(): Promise<TimelineRange[]> {
    return db
      .select({
        ...getTableColumns(timelineRangeTable),
        coverAsset: {
          ...getTableColumns(assetTable)
        }
      })
      .from(timelineRangeTable)
      .leftJoin(assetTable, eq(assetTable.id, timelineRangeTable.coverAssetId))
      .orderBy(sql`${asc(timelineRangeTable.minDate)} nulls first`);
  }

  async getAssetsByTimelineRangeId(id: number, tagId?: number): Promise<Asset[]> {
    return db
      .select({
        ...getTableColumns(assetTable),
        date: getTableColumns(dateTable),
        tags: sql<Tag[]>`COALESCE(JSON_AGG(${tagTable}) FILTER (WHERE ${tagTable.id} IS NOT NULL), '[]'::json)`.as(
          'tags'
        )
      })
      .from(assetTable)
      .leftJoin(dateTable, eq(assetTable.dateId, dateTable.id))
      .leftJoin(assetTagJunctionTable, eq(assetTagJunctionTable.assetId, assetTable.id))
      .leftJoin(tagTable, eq(tagTable.id, assetTagJunctionTable.tagId))
      .innerJoin(timelineRangeTable, eq(timelineRangeTable.id, id))
      .where(
        and(
          isNotNull(dateTable.dateMin),
          isNotNull(dateTable.dateMax),
          sql`daterange(${dateTable.dateMin}, ${dateTable.dateMax}, '[]') && daterange(${timelineRangeTable.minDate}, ${timelineRangeTable.maxDate}, '[]')`,
          eq(assetTable.isPublished, true),
          tagId
            ? exists(
                db
                  .select({ _: sql`1` })
                  .from(assetTagJunctionTable)
                  .where(and(eq(assetTagJunctionTable.assetId, assetTable.id), eq(assetTagJunctionTable.tagId, tagId)))
              )
            : undefined
        )
      )
      .groupBy(assetTable.id, dateTable.id);
  }

  async getUniqueTagsByTimelineRangeId(id: number): Promise<Tag[]> {
    return db
      .select({
        id: tagTable.id,
        name: tagTable.name
      })
      .from(tagTable)
      .innerJoin(assetTagJunctionTable, eq(assetTagJunctionTable.tagId, tagTable.id))
      .innerJoin(assetTable, eq(assetTable.id, assetTagJunctionTable.assetId))
      .innerJoin(dateTable, eq(dateTable.id, assetTable.dateId))
      .innerJoin(timelineRangeTable, eq(timelineRangeTable.id, id))
      .where(
        and(
          isNotNull(dateTable.dateMin),
          isNotNull(dateTable.dateMax),
          sql`daterange(${dateTable.dateMin}, ${dateTable.dateMax}, '[]') && daterange(${timelineRangeTable.minDate}, ${timelineRangeTable.maxDate}, '[]')`,
          eq(assetTable.isPublished, true)
        )
      )
      .groupBy(tagTable.id)
      .orderBy(tagTable.name);
  }

  async createTimelineRange(newTimelineRange: NewTimelineRange): Promise<number | null> {
    const result = await db
      .insert(timelineRangeTable)
      .values(newTimelineRange)
      .returning({ id: timelineRangeTable.id });
    return result.at(0)?.id ?? null;
  }

  async updateTimelineRange(updatedTimelineRange: UpdatedTimelineRange): Promise<void> {
    const { id, ...values } = updatedTimelineRange;
    await db.update(timelineRangeTable).set(values).where(eq(timelineRangeTable.id, id));
  }

  async deleteTimelineRange(id: number): Promise<void> {
    await db.delete(timelineRangeTable).where(eq(timelineRangeTable.id, id));
  }
}

export const timelineRepository: Readonly<TimelineRepository> = Object.freeze(new DrizzleTimelineRepository());

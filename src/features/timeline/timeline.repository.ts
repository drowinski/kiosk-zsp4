import { TimelineRange, UpdatedTimelineRange } from '@/features/timeline/timeline.validation';
import { db } from '@/lib/db/connection';
import { timelineRangeTable } from '@/features/timeline/timeline.db';
import { and, asc, eq, getTableColumns, isNotNull, sql } from 'drizzle-orm';
import { assetTable, dateTable } from '@/features/assets/assets.db';
import { Asset } from '@/features/assets/assets.validation';
import { assetTagJunctionTable, tagTable } from '@/features/tags/tags.db';
import { Tag } from '@/features/tags/tags.validation';

export interface TimelineRepository {
  getTimelineRangeById(id: number): Promise<TimelineRange | null>;

  getAllTimelineRanges(): Promise<TimelineRange[]>;

  getAllAssetsInTimelineRangeById(id: number): Promise<Asset[]>;

  updateTimelineRange(updatedTimelineRange: UpdatedTimelineRange): Promise<void>;
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

  async getAllAssetsInTimelineRangeById(id: number): Promise<Asset[]> {
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
      .leftJoin(timelineRangeTable, eq(timelineRangeTable.id, id))
      .where(
        and(
          isNotNull(dateTable.dateMin),
          isNotNull(dateTable.dateMax),
          sql`daterange(${dateTable.dateMin}, ${dateTable.dateMax}, '[]') && daterange(${timelineRangeTable.minDate}, ${timelineRangeTable.maxDate}, '[]')`
        )
      )
      .groupBy(assetTable.id, dateTable.id);
  }

  async updateTimelineRange(updatedTimelineRange: UpdatedTimelineRange): Promise<void> {
    const { id, ...values } = updatedTimelineRange;
    await db.update(timelineRangeTable).set(values).where(eq(timelineRangeTable.id, id));
  }
}

export const timelineRepository: Readonly<TimelineRepository> = Object.freeze(new DrizzleTimelineRepository());

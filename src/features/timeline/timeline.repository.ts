import { TimelineRange } from '@/features/timeline/timeline.validation';
import { db } from '@/lib/db/connection';
import { timelineRangesTable } from '@/features/timeline/timeline.db';
import { and, asc, eq, getTableColumns, isNotNull, sql } from 'drizzle-orm';
import { assetTable, dateTable } from '@/features/assets/assets.db';
import { Asset } from '@/features/assets/assets.validation';
import { assetTagJunctionTable, tagTable } from '@/features/tags/tags.db';
import { Tag } from '@/features/tags/tags.validation';

export interface TimelineRepository {
  getTimelineRangeById(id: number): Promise<TimelineRange | null>;

  getAllTimelineRanges(): Promise<TimelineRange[]>;

  getAllAssetsInTimelineRangeById(id: number): Promise<Asset[]>;
}

export class DrizzleTimelineRepository implements TimelineRepository {
  async getTimelineRangeById(id: number): Promise<TimelineRange | null> {
    const timelineRanges = await db
      .select({
        ...getTableColumns(timelineRangesTable),
        coverAsset: {
          ...getTableColumns(assetTable)
        }
      })
      .from(timelineRangesTable)
      .leftJoin(assetTable, eq(assetTable.id, timelineRangesTable.coverAssetId))
      .where(eq(timelineRangesTable.id, id));
    return timelineRanges.at(0) ?? null;
  }

  async getAllTimelineRanges(): Promise<TimelineRange[]> {
    return db
      .select({
        ...getTableColumns(timelineRangesTable),
        coverAsset: {
          ...getTableColumns(assetTable)
        }
      })
      .from(timelineRangesTable)
      .leftJoin(assetTable, eq(assetTable.id, timelineRangesTable.coverAssetId))
      .orderBy(sql`${asc(timelineRangesTable.minDate)} nulls first`);
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
      .leftJoin(timelineRangesTable, eq(timelineRangesTable.id, id))
      .where(
        and(
          isNotNull(dateTable.dateMin),
          isNotNull(dateTable.dateMax),
          sql`daterange(${dateTable.dateMin}, ${dateTable.dateMax}, '[]') && daterange(${timelineRangesTable.minDate}, ${timelineRangesTable.maxDate}, '[]')`
        )
      )
      .groupBy(assetTable.id, dateTable.id);
  }
}

export const timelineRepository: Readonly<TimelineRepository> = Object.freeze(new DrizzleTimelineRepository());

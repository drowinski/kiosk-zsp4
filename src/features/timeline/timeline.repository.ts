import { TimelineRange } from '@/features/timeline/timeline.validation';
import { db } from '@/lib/db/connection';
import { timelineRangesTable } from '@/features/timeline/timeline.db';
import { asc, eq, getTableColumns, sql } from 'drizzle-orm';
import { assetTable } from '@/features/assets/assets.db';

export interface TimelineRepository {
  getTimelineRangeById(id: number): Promise<TimelineRange | null>;

  getAllTimelineRanges(): Promise<TimelineRange[]>;
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
}

export const timelineRepository: Readonly<TimelineRepository> = Object.freeze(new DrizzleTimelineRepository());

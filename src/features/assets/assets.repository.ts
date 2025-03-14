import { Asset, AssetType, NewAsset, UpdatedAsset } from '@/features/assets/assets.validation';
import { db } from '@/lib/db/connection';
import { assetTable, dateTable } from '@/features/assets/assets.db';
import { and, asc, count, desc, eq, getTableColumns, gte, ilike, inArray, lte, sql } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';
import { assetTagJunctionTable, tagTable } from '@/features/tags/tags.db';
import { Tag } from '@/features/tags/tags.validation';

export interface AssetFiltering {
  assetType?: AssetType[];
  description?: string;
  dateMin?: Date;
  dateMax?: Date;
}

export interface AssetSorting {
  property: 'date' | 'description' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface AssetOptions {
  filters?: AssetFiltering;
  sorting?: AssetSorting;
  pagination?: Pagination;
}

export interface AssetRepository {
  getAssetById(id: number): Promise<Asset | null>;

  getAllAssets(options?: AssetOptions): Promise<Asset[]>;

  getAssetCount(options?: AssetOptions): Promise<number>;

  createAsset(newAsset: NewAsset): Promise<void>;

  updateAsset(updatedAsset: UpdatedAsset): Promise<void>;
}

export class DrizzleAssetRepository implements AssetRepository {
  async getAssetById(id: number): Promise<Asset | null> {
    const assets = await db
      .select({
        ...getTableColumns(assetTable),
        date: {
          ...getTableColumns(dateTable)
        },
        tags: sql<Tag[]>`COALESCE(JSON_AGG(${tagTable}) FILTER (WHERE ${tagTable.id} IS NOT NULL), '[]'::json)`.as('tags')
      })
      .from(assetTable)
      .leftJoin(dateTable, eq(dateTable.id, assetTable.dateId))
      .leftJoin(assetTagJunctionTable, eq(assetTagJunctionTable.assetId, assetTable.id))
      .leftJoin(tagTable, eq(tagTable.id, assetTagJunctionTable.tagId))
      .groupBy(assetTable.id, dateTable.id)
      .where(eq(assetTable.id, id));

    return assets.at(0) ?? null;
  }

  async getAllAssets(options?: AssetOptions): Promise<Asset[]> {
    const query = db
      .select({
        ...getTableColumns(assetTable),
        date: {
          ...getTableColumns(dateTable)
        },
        tags: sql<Tag[]>`COALESCE(JSON_AGG(${tagTable}) FILTER (WHERE ${tagTable.id} IS NOT NULL), '[]'::json)`.as('tags')
      })
      .from(assetTable)
      .leftJoin(dateTable, eq(dateTable.id, assetTable.dateId))
      .leftJoin(assetTagJunctionTable, eq(assetTagJunctionTable.assetId, assetTable.id))
      .leftJoin(tagTable, eq(tagTable.id, assetTagJunctionTable.tagId))
      .groupBy(assetTable.id, dateTable.id)
      .orderBy(desc(assetTable.id));

    return options ? this.buildQueryWithOptions(query.$dynamic(), options) : query;
  }

  async getAssetCount(options?: Omit<AssetOptions, 'sorting'>): Promise<number> {
    const query = db
      .select({ count: count() })
      .from(assetTable)
      .leftJoin(dateTable, eq(assetTable.dateId, dateTable.id));

    const result = options ? await this.buildQueryWithOptions(query.$dynamic(), options) : await query;

    return result.at(0)?.count || 0;
  }

  private buildQueryWithOptions<T extends PgSelect>(query: T, options: AssetOptions): T {
    if (options.filters) {
      const { assetType, description, dateMin, dateMax } = options.filters;
      query = query.where(
        and(
          assetType && assetType.length > 0 ? inArray(assetTable.assetType, assetType) : undefined,
          description ? ilike(assetTable.description, `%${description}%`) : undefined,
          dateMin ? gte(dateTable.dateMax, dateMin) : undefined,
          dateMax ? lte(dateTable.dateMin, dateMax) : undefined
        )
      );
    }

    if (options.sorting) {
      const { property, direction } = options.sorting;
      const column = {
        date: dateTable.dateMin,
        description: assetTable.description,
        createdAt: assetTable.createdAt,
        updatedAt: assetTable.updatedAt
      }[property];
      const directionFunc = direction === 'asc' ? asc : desc;
      query = query.orderBy(sql`${directionFunc(column)} nulls last`);
    }

    if (options.pagination) {
      const { page, pageSize } = options.pagination;
      query = query.offset(page * pageSize).limit(pageSize);
    }

    return query;
  }

  async createAsset(newAsset: NewAsset): Promise<void> {
    const { date: dateValues, ...assetValues } = newAsset;

    await db.transaction(async (tx) => {
      let resultDate;
      if (dateValues) {
        resultDate = (await tx.insert(dateTable).values(dateValues).returning()).at(0);

        if (!resultDate) {
          tx.rollback();
          return null;
        }
      }

      const resultAsset = (
        await tx
          .insert(assetTable)
          .values({
            dateId: resultDate?.id,
            ...assetValues
          })
          .returning()
      ).at(0);

      if (!resultAsset) {
        return null;
      }

      const resultAssetWithDate = {
        ...resultAsset,
        date: resultDate ?? null
      };

      return resultAssetWithDate ?? null;
    });
  }

  async updateAsset(updatedAsset: UpdatedAsset): Promise<void> {
    const { date: dateValues, ...assetValues } = updatedAsset;
    console.log(dateValues);
    await db.transaction(async (tx) => {
      let resultDate;
      if (dateValues) {
        const { id: dateId, ...dateValuesWithoutId } = dateValues;

        if (dateId) {
          resultDate = (
            await tx.update(dateTable).set(dateValuesWithoutId).where(eq(dateTable.id, dateId)).returning()
          ).at(0);
        }

        if (!resultDate) {
          resultDate = (await tx.insert(dateTable).values(dateValuesWithoutId).returning()).at(0);
        }

        if (!resultDate) {
          tx.rollback();
          return null;
        }
      } else if (dateValues === null) {
        console.log('tryna delete');
        const assetSelect = tx
          .$with('date_id')
          .as(tx.select({ dateId: assetTable.dateId }).from(assetTable).where(eq(assetTable.id, assetValues.id)));
        await tx
          .with(assetSelect)
          .delete(dateTable)
          .where(eq(dateTable.id, sql`(SELECT date_id FROM ${assetSelect})`));
      }

      const { id: assetId, ...assetValuesWithoutId } = assetValues;
      const resultAsset = (
        await tx
          .update(assetTable)
          .set({
            dateId: resultDate?.id,
            ...assetValuesWithoutId
          })
          .where(eq(assetTable.id, assetId))
          .returning()
      ).at(0);

      if (!resultAsset) {
        return null;
      }

      const resultAssetWithDate = {
        ...resultAsset,
        date: resultDate ?? null
      };

      return resultAssetWithDate ?? null;
    });
  }
}

export const assetRepository: Readonly<AssetRepository> = Object.freeze(new DrizzleAssetRepository());

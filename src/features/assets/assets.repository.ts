import { Asset, AssetType, BaseAsset, NewAsset, UpdatedAsset } from '@/features/assets/assets.validation';
import { db } from '@/lib/db/connection';
import { assetTable, dateTable } from '@/features/assets/assets.db';
import { and, asc, count, desc, eq, getTableColumns, gte, ilike, inArray, lte, notInArray, sql } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';
import { assetTagJunctionTable, tagTable } from '@/features/tags/tags.db';
import { Tag } from '@/features/tags/tags.validation';
import { Transaction } from '@/lib/db/types';

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

export interface AssetGetOptions {
  filters?: AssetFiltering;
  sorting?: AssetSorting;
  pagination?: Pagination;
}

export interface AssetRepository {
  getAssetById(id: number): Promise<Asset | null>;

  getAssetsByIds(...ids: number[]): Promise<Asset[]>;

  getAssets(options?: AssetGetOptions): Promise<Asset[]>;

  getAssetCount(options?: AssetGetOptions): Promise<number>;

  createAsset(newAsset: NewAsset): Promise<BaseAsset | null>;

  updateAsset(updatedAsset: UpdatedAsset): Promise<void>;

  updateAssets(ids: number[], updatedValues: Omit<UpdatedAsset, 'id'>): Promise<void>;

  deleteAsset(id: number): Promise<BaseAsset | null>;

  deleteAssets(...ids: number[]): Promise<BaseAsset[]>;
}

export class DrizzleAssetRepository implements AssetRepository {
  async getAssetById(id: number): Promise<Asset | null> {
    const assets = await db
      .select({
        ...getTableColumns(assetTable),
        date: {
          ...getTableColumns(dateTable)
        },
        tags: sql<Tag[]>`COALESCE(JSON_AGG(${tagTable}) FILTER (WHERE ${tagTable.id} IS NOT NULL), '[]'::json)`.as(
          'tags'
        )
      })
      .from(assetTable)
      .leftJoin(dateTable, eq(dateTable.id, assetTable.dateId))
      .leftJoin(assetTagJunctionTable, eq(assetTagJunctionTable.assetId, assetTable.id))
      .leftJoin(tagTable, eq(tagTable.id, assetTagJunctionTable.tagId))
      .groupBy(assetTable.id, dateTable.id)
      .where(eq(assetTable.id, id));

    return assets.at(0) ?? null;
  }

  async getAssetsByIds(...ids: number[]): Promise<Asset[]> {
    return db
      .select({
        ...getTableColumns(assetTable),
        date: {
          ...getTableColumns(dateTable)
        },
        tags: sql<Tag[]>`COALESCE(JSON_AGG(${tagTable}) FILTER (WHERE ${tagTable.id} IS NOT NULL), '[]'::json)`.as(
          'tags'
        )
      })
      .from(assetTable)
      .leftJoin(dateTable, eq(dateTable.id, assetTable.dateId))
      .leftJoin(assetTagJunctionTable, eq(assetTagJunctionTable.assetId, assetTable.id))
      .leftJoin(tagTable, eq(tagTable.id, assetTagJunctionTable.tagId))
      .groupBy(assetTable.id, dateTable.id)
      .where(inArray(assetTable.id, ids));
  }

  async getAssets(options?: AssetGetOptions): Promise<Asset[]> {
    const query = db
      .select({
        ...getTableColumns(assetTable),
        date: {
          ...getTableColumns(dateTable)
        },
        tags: sql<Tag[]>`COALESCE(JSON_AGG(${tagTable}) FILTER (WHERE ${tagTable.id} IS NOT NULL), '[]'::json)`.as(
          'tags'
        )
      })
      .from(assetTable)
      .leftJoin(dateTable, eq(dateTable.id, assetTable.dateId))
      .leftJoin(assetTagJunctionTable, eq(assetTagJunctionTable.assetId, assetTable.id))
      .leftJoin(tagTable, eq(tagTable.id, assetTagJunctionTable.tagId))
      .groupBy(assetTable.id, dateTable.id)
      .orderBy(desc(assetTable.id));

    return options ? this.buildQueryWithOptions(query.$dynamic(), options) : query;
  }

  async getAssetCount(options?: Omit<AssetGetOptions, 'sorting'>): Promise<number> {
    const query = db
      .select({ count: count() })
      .from(assetTable)
      .leftJoin(dateTable, eq(assetTable.dateId, dateTable.id));

    const result = options ? await this.buildQueryWithOptions(query.$dynamic(), options) : await query;

    return result.at(0)?.count || 0;
  }

  private buildQueryWithOptions<T extends PgSelect>(query: T, options: AssetGetOptions): T {
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

  async createAsset(newAsset: NewAsset): Promise<BaseAsset | null> {
    const { date: dateValues, ...assetValues } = newAsset;

    return db.transaction(async (tx) => {
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

  private async _updateAsset(updatedAsset: UpdatedAsset, tx?: Transaction): Promise<void> {
    const { date: dateValues, tagIds, ...assetValues } = updatedAsset;
    const dbOrTx = tx ?? db;
    await dbOrTx.transaction(async (tx) => {
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
          return tx.rollback();
        }
      } else if (dateValues === null) {
        const assetSelect = tx
          .$with('date_id')
          .as(tx.select({ dateId: assetTable.dateId }).from(assetTable).where(eq(assetTable.id, assetValues.id)));
        await tx
          .with(assetSelect)
          .delete(dateTable)
          .where(eq(dateTable.id, sql`(SELECT date_id FROM ${assetSelect})`));
      }

      if (tagIds) {
        await tx
          .delete(assetTagJunctionTable)
          .where(
            and(eq(assetTagJunctionTable.assetId, assetValues.id), notInArray(assetTagJunctionTable.tagId, tagIds))
          );

        if (tagIds.length > 0) {
          await tx
            .insert(assetTagJunctionTable)
            .values(
              tagIds.map((tagId) => ({
                assetId: assetValues.id,
                tagId
              }))
            )
            .onConflictDoNothing();
        }
      }

      const { id: assetId, ...assetValuesWithoutId } = assetValues;
      if (Object.keys(assetValuesWithoutId).length > 0) {
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
          return tx.rollback();
        }
      }
    });
  }

  async updateAsset(updatedAsset: UpdatedAsset): Promise<void> {
    await this._updateAsset(updatedAsset);
  }

  async updateAssets(ids: number[], updatedValues: Omit<UpdatedAsset, 'id'>) {
    await db.transaction(async (tx) => {
      for (const id of ids) {
        await this._updateAsset({ id, ...updatedValues }, tx);
      }
    });
  }

  async deleteAsset(id: number): Promise<BaseAsset | null> {
    return db.transaction(async (tx) => {
      const [asset] = await tx.delete(assetTable).where(eq(assetTable.id, id)).returning();
      if (asset.dateId) {
        await tx.delete(dateTable).where(eq(dateTable.id, asset.dateId));
      }
      return asset;
    });
  }

  async deleteAssets(...ids: number[]): Promise<BaseAsset[]> {
    return db.transaction(async (tx) => {
      const assets = await tx.delete(assetTable).where(inArray(assetTable.id, ids)).returning();
      await tx.delete(dateTable).where(
        inArray(
          dateTable.id,
          assets.reduce<number[]>((array, asset) => {
            if (asset.dateId) array.push(asset.dateId);
            return array;
          }, [])
        )
      );
      return assets;
    });
  }
}

export const assetRepository: Readonly<AssetRepository> = Object.freeze(new DrizzleAssetRepository());

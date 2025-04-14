import { Asset, AssetType, BaseAsset, NewAsset, UpdatedAsset } from '@/features/assets/assets.schemas';
import { db } from '@/lib/.server/db/connection';
import { assetTable, dateTable } from '@/features/assets/.server/assets.db';
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  lte, max,
  min,
  notInArray,
  sql
} from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';
import { assetTagJunctionTable, tagTable } from '@/features/tags/.server/tags.db';
import { Tag } from '@/features/tags/tags.schemas';
import { Transaction } from '@/lib/.server/db/types';

export interface AssetFiltering {
  assetType?: AssetType[];
  description?: string;
  dateMin?: Date;
  dateMax?: Date;
  isPublished?: boolean;
  tagIds?: number[];
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

  getRandomAssets(count: number, options?: AssetGetOptions): Promise<Asset[]>;

  getAssetCount(options?: AssetGetOptions): Promise<number>;

  getAssetStats(options?: AssetGetOptions): Promise<{
    count: number;
    minDate: Date | null;
    maxDate: Date | null;
  }>;

  createAsset(newAsset: NewAsset): Promise<BaseAsset | null>;

  updateAsset(updatedAsset: UpdatedAsset): Promise<void>;

  updateAssets(ids: number[], updatedValues: Omit<UpdatedAsset, 'id'>): Promise<void>;

  deleteAsset(id: number): Promise<BaseAsset | null>;

  deleteAssets(...ids: number[]): Promise<BaseAsset[]>;
}

export class DrizzleAssetRepository implements AssetRepository {
  private readonly assetJsonTags = db.$with('asset_json_tags').as(
    db
      .select({
        assetId: assetTagJunctionTable.assetId,
        tags: sql<
          Tag[]
        >`COALESCE(JSONB_AGG(${tagTable} ORDER BY ${tagTable.name}) FILTER (WHERE ${tagTable.id} IS NOT NULL), '[]'::jsonb)`.as(
          'json_tags'
        )
      })
      .from(assetTagJunctionTable)
      .leftJoin(tagTable, eq(assetTagJunctionTable.tagId, tagTable.id))
      .groupBy(assetTagJunctionTable.assetId)
  );
  private readonly fullSelectQuery = db
    .with(this.assetJsonTags)
    .select({
      ...getTableColumns(assetTable),
      date: {
        ...getTableColumns(dateTable)
      },
      tags: sql<Tag[]>`COALESCE(${this.assetJsonTags.tags}, '[]'::jsonb)`.as('tags')
    })
    .from(assetTable)
    .leftJoin(dateTable, eq(dateTable.id, assetTable.dateId))
    .leftJoin(this.assetJsonTags, eq(this.assetJsonTags.assetId, assetTable.id));

  async getAssetById(id: number): Promise<Asset | null> {
    const [asset] = await this.fullSelectQuery.where(eq(assetTable.id, id));

    return asset ?? null;
  }

  async getAssetsByIds(...ids: number[]): Promise<Asset[]> {
    return this.fullSelectQuery.where(inArray(assetTable.id, ids));
  }

  async getAssets(options?: AssetGetOptions): Promise<Asset[]> {
    const query = this.fullSelectQuery.orderBy(desc(assetTable.id));

    return options ? this.buildQueryWithOptions(query.$dynamic(), options) : query;
  }

  async getRandomAssets(count: number, options?: Omit<AssetGetOptions, 'sorting'>): Promise<Asset[]> {
    const query = this.fullSelectQuery.orderBy(sql`random()`).limit(count);

    return options ? this.buildQueryWithOptions(query.$dynamic(), options) : query;
  }

  async getAssetCount(options?: Omit<AssetGetOptions, 'sorting'>): Promise<number> {
    const query = db
      .with(this.assetJsonTags)
      .select({ count: count() })
      .from(assetTable)
      .leftJoin(dateTable, eq(assetTable.dateId, dateTable.id))
      .leftJoin(this.assetJsonTags, eq(this.assetJsonTags.assetId, assetTable.id));

    const [result] = options ? await this.buildQueryWithOptions(query.$dynamic(), options) : await query;

    return result?.count ?? 0;
  }

  async getAssetStats(options?: Omit<AssetGetOptions, 'sorting'>) {
    const query = db
      .with(this.assetJsonTags)
      .select({ count: count(), minDate: min(dateTable.dateMin), maxDate: max(dateTable.dateMax) })
      .from(assetTable)
      .leftJoin(dateTable, eq(assetTable.dateId, dateTable.id))
      .leftJoin(this.assetJsonTags, eq(this.assetJsonTags.assetId, assetTable.id));

    const [result] = options ? await this.buildQueryWithOptions(query.$dynamic(), options) : await query;

    return result;
  }

  private buildQueryWithOptions<T extends PgSelect>(query: T, options: AssetGetOptions): T {
    if (options.filters) {
      const { assetType, description, dateMin, dateMax, isPublished, tagIds } = options.filters;
      console.log('pub', isPublished);
      query = query.where(
        and(
          assetType !== undefined && assetType.length > 0 ? inArray(assetTable.assetType, assetType) : undefined,
          description !== undefined ? ilike(assetTable.description, `%${description}%`) : undefined,
          dateMin !== undefined ? gte(dateTable.dateMax, dateMin) : undefined,
          dateMax !== undefined ? lte(dateTable.dateMin, dateMax) : undefined,
          isPublished !== undefined ? eq(assetTable.isPublished, isPublished) : undefined,
          tagIds !== undefined
            ? sql`${this.assetJsonTags.tags} @> '${sql.raw(JSON.stringify(tagIds.map((id) => ({ id }))))}'::jsonb`
            : undefined
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
      const dateIdSelect = tx
        .$with('date_id_select')
        .as(tx.select({ dateId: assetTable.dateId }).from(assetTable).where(eq(assetTable.id, assetValues.id)));
      if (dateValues) {
        [resultDate] = await tx
          .with(dateIdSelect)
          .update(dateTable)
          .set(dateValues)
          .from(dateIdSelect)
          .where(eq(dateTable.id, dateIdSelect.dateId))
          .returning();

        if (!resultDate) {
          [resultDate] = await tx.insert(dateTable).values(dateValues).returning();
        }

        if (!resultDate) {
          tx.rollback();
        }
      } else if (dateValues === null) {
        await tx
          .with(dateIdSelect)
          .delete(dateTable)
          .where(eq(dateTable.id, sql`(SELECT date_id FROM ${dateIdSelect})`));
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
      if (resultDate || Object.keys(assetValuesWithoutId).length > 0) {
        const [resultAsset] = await tx
          .update(assetTable)
          .set({
            dateId: resultDate?.id,
            ...assetValuesWithoutId
          })
          .where(eq(assetTable.id, assetId))
          .returning();

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

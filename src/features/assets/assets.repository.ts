import { Asset, NewAsset, UpdatedAsset } from '@/features/assets/assets.validation';
import { db } from '@/lib/db/connection';
import { assetTable, dateTable } from '@/features/assets/assets.db';
import { and, asc, count, desc, eq, getTableColumns, ilike, sql } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';

interface Filters {
  dateMin?: Date;
  dateMax?: Date;
  description?: string;
}

interface Sorting {
  property: 'date' | 'description' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

interface Pagination {
  page: number;
  pageSize: number;
}

interface Options {
  filters?: Filters;
  sorting?: Sorting;
  pagination?: Pagination;
}

export interface AssetRepository {
  getAssetById(id: number): Promise<Asset | null>;

  getAllAssets(options?: Options): Promise<Asset[]>;

  getAssetCount(options?: Options): Promise<number>;

  createAsset(newAsset: NewAsset): Promise<Asset | null>;

  updateAsset(updatedAsset: UpdatedAsset): Promise<Asset | null>;
}

export class DrizzleAssetRepository implements AssetRepository {
  async getAssetById(id: number): Promise<Asset | null> {
    const assets = await db
      .select({
        ...getTableColumns(assetTable),
        date: {
          ...getTableColumns(dateTable)
        }
      })
      .from(assetTable)
      .leftJoin(dateTable, eq(assetTable.dateId, dateTable.id))
      .where(eq(assetTable.id, id));
    return assets.at(0) ?? null;
  }

  async getAllAssets(options?: Options): Promise<Asset[]> {
    const query = db
      .select({
        ...getTableColumns(assetTable),
        date: {
          ...getTableColumns(dateTable)
        }
      })
      .from(assetTable)
      .leftJoin(dateTable, eq(assetTable.dateId, dateTable.id))
      .orderBy(desc(assetTable.id));

    return options ? this.buildQueryWithOptions(query.$dynamic(), options) : query;
  }

  async getAssetCount(options?: Omit<Options, 'sorting'>): Promise<number> {
    const query = db
      .select({ count: count() })
      .from(assetTable)
      .leftJoin(dateTable, eq(assetTable.dateId, dateTable.id));

    const result = options ? await this.buildQueryWithOptions(query.$dynamic(), options) : await query;

    return result.at(0)?.count || 0;
  }

  private buildQueryWithOptions<T extends PgSelect>(query: T, options: Options): T {
    if (options.filters) {
      const { description, dateMin, dateMax } = options.filters;
      query = query.where(
        and(
          description ? ilike(assetTable.description, `%${description}%`) : undefined,
          dateMin ? sql<boolean>`${dateMin} < ${dateTable.dateMax}` : undefined,
          dateMax ? sql<boolean>`${dateMax} > ${dateTable.dateMin}` : undefined
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
      query = query.orderBy(directionFunc(column));
    }

    if (options.pagination) {
      const { page, pageSize } = options.pagination;
      query = query.offset(page * pageSize).limit(pageSize);
    }

    return query;
  }

  async createAsset(newAsset: NewAsset): Promise<Asset | null> {
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

  async updateAsset(updatedAsset: UpdatedAsset): Promise<Asset | null> {
    const { date: dateValues, ...assetValues } = updatedAsset;
    console.log(dateValues);
    return db.transaction(async (tx) => {
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

export const assetRepository: AssetRepository = Object.freeze(new DrizzleAssetRepository());

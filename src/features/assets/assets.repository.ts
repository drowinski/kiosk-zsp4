import { Asset, NewAsset, UpdatedAsset } from '@/features/assets/assets.validation';
import { db } from '@/lib/db/connection';
import { assetTable, dateTable } from '@/features/assets/assets.db';
import { eq, getTableColumns, sql } from 'drizzle-orm';

interface AssetRepository {
  getAssetById(id: number): Promise<Asset | null>;

  getAllAssets(): Promise<Asset[]>;

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

  async getAllAssets(): Promise<Asset[]> {
    return db
      .select({
        ...getTableColumns(assetTable),
        date: {
          ...getTableColumns(dateTable)
        }
      })
      .from(assetTable)
      .leftJoin(dateTable, eq(assetTable.dateId, dateTable.id));
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
        const assetSelect = tx.$with('date_id').as(
          tx.select({ dateId: assetTable.dateId }).from(assetTable).where(eq(assetTable.id, assetValues.id))
        );
        await tx.with(assetSelect).delete(dateTable).where(eq(dateTable.id, sql`(SELECT date_id FROM ${assetSelect})`));
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

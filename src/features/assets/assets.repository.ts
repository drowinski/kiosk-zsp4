import { Asset, NewAsset } from '@/features/assets/assets.validation';
import { db } from '@/lib/db/connection';
import { assetTable } from '@/features/assets/assets.db';
import { eq } from 'drizzle-orm';

interface AssetRepository {
  getAssetById(id: number): Promise<Asset | null>;

  createAsset(newAsset: NewAsset): Promise<Asset | null>;
}

export class DrizzleAssetRepository implements AssetRepository {
  async getAssetById(id: number): Promise<Asset | null> {
    const result = await db.select().from(assetTable).where(eq(assetTable.id, id));
    return result.at(0) ?? null;
  }

  async createAsset(newAsset: NewAsset): Promise<Asset | null> {
    const result = await db.insert(assetTable).values(newAsset).returning();
    return result.at(0) ?? null;
  }
}

export const assetRepository: AssetRepository = Object.freeze(new DrizzleAssetRepository());

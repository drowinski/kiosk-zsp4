import { assetRepository, DrizzleAssetRepository } from '@/features/assets/assets.repository';
import { ReadStream } from 'node:fs';
import { FileManager } from '@/lib/files';
import { env } from '@/lib/env';
import * as crypto from 'node:crypto';
import { Asset, AssetType, NewAsset } from '@/features/assets/assets.validation';
import * as mime from 'mime-types';

export class AssetService {
  private readonly assetRepository: DrizzleAssetRepository;
  private readonly fileManager: FileManager;
  private readonly mimeTypeToAssetTypeMap = new Map<string, AssetType>([
    ['image', 'image'],
    ['video', 'video'],
    ['audio', 'audio']
  ]);

  constructor(assetRepository: DrizzleAssetRepository, fileManager: FileManager) {
    this.assetRepository = assetRepository;
    this.fileManager = fileManager;
  }

  async uploadAsset(stream: ReadStream, assetData: Omit<NewAsset, 'fileName' | 'assetType'>): Promise<Asset> {
    const mimeType = this.normalizeMimeType(assetData.mimeType);
    const fileName = this.generateFileName(mimeType);

    await this.fileManager.saveFileFromStream(stream, fileName);

    const asset = await this.assetRepository.createAsset({
      fileName: fileName,
      mimeType: mimeType,
      assetType: this.getAssetTypeFromMimeType(mimeType),
      description: assetData.description,
      date: assetData.date
    });

    if (!asset) {
      throw new Error('An error occurred while adding asset to repository.');
    }

    return asset;
  }

  private generateFileName(mimeType: string): string {
    return crypto.randomUUID() + '.' + mime.extension(mimeType);
  }

  private normalizeMimeType(mimeType: string): string {
    mimeType = mimeType.trim().toLowerCase();
    const extension = mime.extension(mimeType);
    if (!extension) {
      throw new Error('Unrecognized MIME type.');
    }
    return mimeType;
  }

  private getAssetTypeFromMimeType(mimeType: string): AssetType {
    const mediaType = mimeType.split('/').at(0);
    if (!mediaType) {
      throw new Error('Invalid MIME type string.');
    }
    const assetType = this.mimeTypeToAssetTypeMap.get(mediaType);
    if (!assetType) {
      throw new Error('Unsupported MIME type.');
    }
    return assetType;
  }
}

export const assetService = Object.freeze(new AssetService(assetRepository, new FileManager(env.ASSET_ROOT_DIR)));

import { assetRepository, DrizzleAssetRepository } from '@/features/assets/assets.repository';
import { ReadStream } from 'node:fs';
import { FileManager } from '@/lib/files';
import { env } from '@/lib/env';
import * as crypto from 'node:crypto';
import * as path from 'node:path';
import { Asset, AssetType } from '@/features/assets/assets.validation';
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

  async uploadAsset(stream: ReadStream, fileName: string, mimeType: string): Promise<Asset> {
    const newFileName = this.generateFileName(fileName);
    mimeType = this.normalizeMimeType(mimeType);

    const extension = mime.extension(mimeType);
    if (!extension) {
      throw new Error('Unrecognized MIME type.');
    }

    await this.fileManager.saveFileFromStream(stream, newFileName);

    const asset = await this.assetRepository.createAsset({
      fileName: newFileName,
      mimeType: mimeType,
      assetType: this.getAssetTypeFromMimeType(mimeType)
    });

    if (!asset) {
      throw new Error('Error occurred while adding asset to repository.');
    }

    return asset;
  }

  private generateFileName(originalFileNameOrExtension: string): string {
    const extension =
      '.' +
      path
        .parse(originalFileNameOrExtension)
        .ext.replaceAll(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
    return crypto.randomUUID() + extension;
  }

  private normalizeMimeType(mimeType: string): string {
    return mimeType.trim().toLowerCase();
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

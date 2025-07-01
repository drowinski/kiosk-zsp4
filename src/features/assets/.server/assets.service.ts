import { AssetRepository, assetRepository } from '@/features/assets/.server/assets.repository';
import { ReadStream } from 'node:fs';
import { FileManager } from '@/lib/.server/files';
import { env } from '@/lib/.server/env';
import * as crypto from 'node:crypto';
import { AssetType, NewAsset, UpdatedAsset } from '@/features/assets/assets.schemas';
import * as mime from 'mime-types';
import * as path from 'node:path';
import { tryAsync } from '@/utils/try';
import { logger } from '@/lib/.server/logging';
import { ThumbnailGenerator } from '@/lib/.server/thumbnail-generator';

export class AssetService {
  private readonly assetRepository: AssetRepository;
  private readonly fileManager: FileManager;
  private readonly thumbnailDirectory: string;
  private readonly mimeTypeToAssetTypeMap = new Map<string, AssetType>([
    ['image/jpeg', 'image'],
    ['image/png', 'image'],
    ['video/mp4', 'video'],
    ['application/pdf', 'document']
  ]);

  constructor(assetRepository: AssetRepository, fileManager: FileManager, thumbnailDirectory: string) {
    this.assetRepository = assetRepository;
    this.fileManager = fileManager;
    this.thumbnailDirectory = thumbnailDirectory;
  }

  async uploadAsset(stream: ReadStream, assetData: Omit<NewAsset, 'fileName' | 'assetType'>): Promise<void> {
    logger.debug('Normalizing mime type and deriving asset type...', assetData);
    const mimeType = this.normalizeMimeType(assetData.mimeType);
    const assetType = this.getAssetTypeFromMimeType(mimeType);
    logger.debug('Generating file name...', assetData);
    const fileName = this.generateFileName(mimeType);

    logger.debug('Adding entry to asset repository...');
    const createdAsset = await this.assetRepository.createAsset({
      fileName: fileName,
      mimeType: mimeType,
      assetType: assetType,
      description: assetData.description,
      date: assetData.date
    });
    if (!createdAsset) {
      throw new Error("Created asset wasn't returned from repository method.");
    }

    // ...

    logger.debug('Saving asset file...');
    const [, saveFileOk, saveFileError] = await tryAsync(this.fileManager.saveFileFromStream(stream, fileName));
    if (!saveFileOk) {
      logger.warn('Attempting to remove repository entry because of failed upload...');
      const [deletedAsset, deleteAssetOk, deleteAssetError] = await tryAsync(
        this.assetRepository.deleteAsset(createdAsset.id)
      );
      if (!deleteAssetOk) {
        deleteAssetError.cause = saveFileError;
        throw deleteAssetError;
      } else if (!deletedAsset) {
        logger.warn(`No deleted assets returned, possible orphaned entries (ID: ${createdAsset.id}).`);
      }
      throw saveFileError;
    }

    logger.debug('Generating thumbnail...');
    const [, generateThumbnailOk, generateThumbnailError] = await tryAsync(this.generateThumbnail(fileName, assetType));
    if (!generateThumbnailOk) {
      logger.error(generateThumbnailError, `An error occurred while generating thumbnail for file "${fileName}".`);
    }
  }

  async updateAsset(updatedAsset: UpdatedAsset): Promise<void> {
    if (updatedAsset.mimeType !== undefined) {
      logger.debug('Normalizing mime type and deriving asset type...');
      updatedAsset.mimeType = this.normalizeMimeType(updatedAsset.mimeType);
      updatedAsset.assetType = this.getAssetTypeFromMimeType(updatedAsset.mimeType);
    }

    logger.debug('Updating asset repository entry...');
    await this.assetRepository.updateAsset(updatedAsset);
  }

  async updateAssets(ids: number[], updatedValues: Omit<UpdatedAsset, 'id'>): Promise<void> {
    if (updatedValues.mimeType !== undefined) {
      logger.debug('Normalizing mime type and deriving asset type...');
      updatedValues.mimeType = this.normalizeMimeType(updatedValues.mimeType);
      updatedValues.assetType = this.getAssetTypeFromMimeType(updatedValues.mimeType);
    }

    logger.debug('Updating asset repository entries...');
    await this.assetRepository.updateAssets(ids, updatedValues);
  }

  async deleteAssets(...ids: number[]): Promise<void> {
    for (const id of ids) {
      logger.debug('Deleting asset repository entry...');
      const deletedAsset = await this.assetRepository.deleteAsset(id);
      if (!deletedAsset) {
        logger.warn(`Asset ID "${id}" wasn't deleted. The ID may not exist.`);
        continue;
      }

      logger.debug('Deleting asset file...');
      await this.fileManager.deleteFile(deletedAsset.fileName);

      logger.debug('Deleting asset thumbnail...');
      const thumbnailFilePath = this.getThumbnailFilePath(deletedAsset.fileName);
      await this.fileManager.deleteFile(thumbnailFilePath);
    }
  }

  async generateThumbnail(fileName: string, assetType: AssetType): Promise<void> {
    const thumbnailGenerator = new ThumbnailGenerator(this.fileManager, this.thumbnailDirectory, 1024);
    if (assetType === 'image') {
      await thumbnailGenerator.generateFromImage(fileName);
      return;
    } else if (assetType === 'video') {
      await thumbnailGenerator.generateFromVideo(fileName);
      return;
    } else if (assetType === 'document') {
      await thumbnailGenerator.generateFromPDF(fileName);
      return;
    }
  }

  private generateFileName(mimeType: string): string {
    return crypto.randomUUID() + '.' + mime.extension(mimeType);
  }

  private getThumbnailFileName(assetFileName: string): string {
    return assetFileName.split('.')[0] + '.jpeg';
  }

  private getThumbnailFilePath(assetFilePath: string): string {
    return path.join(this.thumbnailDirectory, this.getThumbnailFileName(assetFilePath));
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
    const assetType = this.mimeTypeToAssetTypeMap.get(mimeType);
    if (!assetType) {
      throw new Error('Unsupported MIME type.');
    }
    return assetType;
  }
}

export const assetService: Readonly<AssetService> = Object.freeze(
  new AssetService(assetRepository, new FileManager(env.ASSET_ROOT_DIR), env.ASSET_THUMBNAIL_DIR_NAME)
);

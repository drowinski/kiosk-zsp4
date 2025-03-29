import { AssetRepository, assetRepository } from '@/features/assets/assets.repository';
import { ReadStream } from 'node:fs';
import { FileManager } from '@/lib/files';
import { env } from '@/lib/env';
import * as crypto from 'node:crypto';
import { AssetType, NewAsset, UpdatedAsset } from '@/features/assets/assets.validation';
import * as mime from 'mime-types';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'node:path';
import { tryAsync } from '@/utils/try';
import { logger } from '@/lib/logging';

export class AssetService {
  private readonly assetRepository: AssetRepository;
  private readonly fileManager: FileManager;
  private readonly thumbnailDirectory: string;
  private readonly mimeTypeToAssetTypeMap = new Map<string, AssetType>([
    ['image', 'image'],
    ['video', 'video'],
    ['audio', 'audio']
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
    const [createdAsset, createdAssetOk, createdAssetError] = await tryAsync(
      this.assetRepository.createAsset({
        fileName: fileName,
        mimeType: mimeType,
        assetType: assetType,
        description: assetData.description,
        date: assetData.date
      })
    );
    if (!createdAssetOk) {
      throw createdAssetError;
    }
    if (!createdAsset) {
      throw new Error("Created asset wasn't returned.");
    }

    logger.debug('Saving asset file...');
    const [, saveFileOk, saveFileError] = await tryAsync(this.fileManager.saveFileFromStream(stream, fileName));
    if (!saveFileOk) {
      logger.error(saveFileError);
      logger.warn('Attempting to remove repository entry because of failed upload...');
      const [deletedAssets, deleteAssetOk, deleteAssetError] = await tryAsync(
        this.assetRepository.deleteAssets(createdAsset.id)
      );
      if (!deleteAssetOk) {
        logger.error(deleteAssetError);
      } else if (deletedAssets.length === 0) {
        logger.warn('No deleted assets returned, possible orphaned entries.');
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
    const [, updateAssetOk, updateAssetError] = await tryAsync(this.assetRepository.updateAsset(updatedAsset));
    if (!updateAssetOk) {
      throw updateAssetError;
    }
  }

  async deleteAssets(...ids: number[]): Promise<void> {
    const [assets, assetsOk, assetsError] = await tryAsync(this.assetRepository.deleteAssets(...ids));
    if (!assetsOk) {
      throw assetsError;
    }

    for (const asset of assets) {
      const thumbnailFilePath = this.getThumbnailFilePath(asset.fileName);
      const [, deleteThumbnailOk, deleteThumbnailError] = await tryAsync(
        this.fileManager.deleteFile(thumbnailFilePath)
      );
      if (!deleteThumbnailOk) {
        throw deleteThumbnailError;
      }

      const [, deleteFileOk, deleteFileError] = await tryAsync(this.fileManager.deleteFile(asset.fileName));
      if (!deleteFileOk) {
        throw deleteFileError;
      }
    }
  }

  async generateThumbnail(fileName: string, assetType: AssetType): Promise<void> {
    const originalFilePath = this.fileManager._definePathInsideRootDir(fileName);
    const thumbnailFileName = this.getThumbnailFileName(fileName);

    await new Promise<void>((resolve, reject) => {
      const ffmpegCommand = ffmpeg(originalFilePath)
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          console.error(error);
          reject(error);
        });

      if (assetType === 'image') {
        const outputPath = this.fileManager._definePathInsideRootDir(this.thumbnailDirectory, thumbnailFileName);
        ffmpegCommand.outputFormat('mjpeg').videoFilter('scale=640:-2').save(outputPath);
      } else if (assetType === 'video') {
        ffmpegCommand.thumbnail({
          filename: thumbnailFileName,
          folder: this.fileManager._definePathInsideRootDir(this.thumbnailDirectory),
          timestamps: ['5%'],
          size: '640x?'
        });
      }
    });
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

export const assetService: Readonly<AssetService> = Object.freeze(
  new AssetService(assetRepository, new FileManager(env.ASSET_ROOT_DIR), env.ASSET_THUMBNAIL_DIR_NAME)
);

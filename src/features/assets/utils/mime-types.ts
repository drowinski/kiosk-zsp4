import { AssetType } from '@/features/assets/assets.schemas';

const mimeTypeToAssetTypeMap = new Map<string, AssetType>([
  ['image/jpeg', 'image'],
  ['image/png', 'image'],
  ['video/mp4', 'video'],
  ['application/pdf', 'document']
]);

export function getAssetTypeFromMimeType(mimeType: string) {
  return mimeTypeToAssetTypeMap.get(mimeType);
}

export function getAssetUri(fileName: string): string {
  return env.ASSET_URL_PATH + '/' + fileName;
}

export function getAssetThumbnailUri(fileName: string): string {
  return env.ASSET_URL_PATH + '/' + env.ASSET_THUMBNAIL_DIR_NAME + '/' + fileName.split('.').at(0) + '.jpeg';
}

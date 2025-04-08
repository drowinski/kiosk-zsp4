export function getAssetUri(fileName: string): string {
  return CLIENT_ENV.ASSET_URL_PATH + '/' + fileName;
}

export function getAssetThumbnailUri(fileName: string): string {
  return (
    CLIENT_ENV.ASSET_URL_PATH + '/' + CLIENT_ENV.ASSET_THUMBNAIL_DIR_NAME + '/' + fileName.split('.').at(0) + '.jpeg'
  );
}

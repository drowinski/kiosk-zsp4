export function getAssetUri(fileName: string): string {
  return '/media/' + fileName; // TODO: Use env vars BUT WITHOUT EXPOSING SERVER SECRETS
}

export function getAssetThumbnailUri(fileName: string): string {
  return '/media/thumbnails/' + fileName.split('.').at(0) + '.jpeg'; // TODO: Use env vars BUT WITHOUT EXPOSING SERVER SECRETS
}

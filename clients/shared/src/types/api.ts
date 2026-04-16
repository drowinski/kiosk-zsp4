export interface PagedRequest {
  page?: number;
  size?: number;
}

export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'STAFF' | 'KIOSK';
}

export interface Asset {
  id: string;
  mimeType: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mediaUri: string;
  description: string | null;
  date: AssetDate | null;
  createdAt: Date | null;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
  publishedAt: Date | null;
  publishedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export interface AssetDate {
  min: Date;
  max: Date;
  precision: 'day' | 'month' | 'year' | 'decade' | 'century';
  approximate: boolean;
}

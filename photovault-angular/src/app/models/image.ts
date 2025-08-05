export interface Image {
  id: number;
  filename: string;
  storedFilename: string;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadDate: string;
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
}

export interface ImageStats {
  totalImages: number;
  favorites: number;
  archived: number;
  trash: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  uploadedFiles?: string[];
  failedFiles?: string[];
}

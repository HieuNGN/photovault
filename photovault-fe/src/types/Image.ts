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

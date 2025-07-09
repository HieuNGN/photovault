import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8080/';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// export interface Image {
//     id: number;
//     filename: string;
//     storedFilename: string;
//     originalFilename: string;
//     filePath: string;
//     fileSize: number;
//     contentType: string;
//     uploadDate: string;
//     isFavorite: boolean;
//     isArchived: boolean;
//     isDeleted: boolean;
// }

export const imageApi = {
    // Test connection
    testConnection: () =>
        api.get('/health'),

    // Upload image
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Get all images with pagination
    getAllImages: (page = 0, size = 10) =>
        api.get(`/images?page=${page}&size=${size}`),

    // Get image by ID
    getImageById: (id: number) =>
        api.get(`/images/${id}`),

    // Download image
    downloadImage: (id: number) =>
        api.get(`/images/${id}/download`, { responseType: 'blob' }),

    // Toggle favorite
    toggleFavorite: (id: number) =>
        api.put(`/images/${id}/favorite`),

    // Get favorites
    getFavorites: () =>
        api.get('/images/favorites'),

    // Search images
    searchImages: (query: string) =>
        api.get(`/images/search?query=${query}`),

    // Delete image (move to trash)
    deleteImage: (id: number) =>
        api.delete(`/images/${id}`),

    // Get stats
    getStats: () =>
        api.get('/images/stats'),

    getTrashedImages: () =>
        api.get('/images/trash'),

    restoreImage: (id: number) =>
        api.put(`/images/${id}/restore`),

    permanentlyDeleteImage: (id: number) =>
        api.delete(`/images/${id}/permanent`),

    toggleArchive: (id: number) =>
        api.put(`/images/${id}/archive`),

    getArchivedImages: () =>
        api.get('/images/archived'),
};

export default api;
import { useState, useEffect } from 'react';
import { imageApi } from '../services/api';

export const useThumbnail = (imageId: number, fallbackToRegular = false) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadThumbnail = async () => {
            try {
                setLoading(true);
                setError(false);

                const response = await imageApi.getThumbnail(imageId);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                setThumbnailUrl(url);
            } catch (err) {
                if (fallbackToRegular) {
                    try {
                        const response = await imageApi.downloadImage(imageId);
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        setThumbnailUrl(url);
                    } catch (fallbackErr) {
                        setError(true);
                    }
                } else {
                    setError(true);
                }
            } finally {
                setLoading(false);
            }
        };

        loadThumbnail();

        return () => {
            if (thumbnailUrl) {
                window.URL.revokeObjectURL(thumbnailUrl);
            }
        };
    }, [imageId, fallbackToRegular]);

    return { thumbnailUrl, loading, error };
};

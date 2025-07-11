import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { BrokenImage } from '@mui/icons-material';
import { imageApi } from '../../services/api';

interface ImageThumbnailProps {
    imageId: number;
    alt: string;
    width?: number | string;
    height?: number | string;
    sx?: any;
    fallbackToRegular?: boolean; // Whether to fallback to regular download endpoint
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
                                                           imageId,
                                                           alt,
                                                           width = 200,
                                                           height = 200,
                                                           sx = {},
                                                           fallbackToRegular = false
                                                       }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadThumbnail = async () => {
            try {
                setLoading(true);
                setError(false);

                // Try thumbnail endpoint first
                const response = await imageApi.getThumbnail(imageId);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                setThumbnailUrl(url);
            } catch (err) {
                if (fallbackToRegular) {
                    try {
                        // Fallback to regular download endpoint
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

        // Cleanup function to revoke object URL
        return () => {
            if (thumbnailUrl) {
                window.URL.revokeObjectURL(thumbnailUrl);
            }
        };
    }, [imageId, fallbackToRegular]);

    if (loading) {
        return (
            <Box
                sx={{
                    width,
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    ...sx
                }}
            >
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error || !thumbnailUrl) {
        return (
            <Box
                sx={{
                    width,
                    height,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    color: '#666',
                    ...sx
                }}
            >
                <BrokenImage sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="caption">Failed to load</Typography>
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={thumbnailUrl}
            alt={alt}
            sx={{
                width,
                height,
                objectFit: 'cover',
                borderRadius: 1,
                ...sx
            }}
        />
    );
};

export default ImageThumbnail;

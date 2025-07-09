import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardActions,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material';
import { Unarchive, Download, Delete } from '@mui/icons-material';
import { imageApi } from '../services/api';
import { Image } from '../types/Image';

const Archive: React.FC = () => {
    const [archivedImages, setArchivedImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadArchivedImages = async () => {
        try {
            setLoading(true);
            const response = await imageApi.getArchivedImages();
            setArchivedImages(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load archived images');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArchivedImages();
    }, []);

    const handleUnarchiveImage = async (imageId: number) => {
        try {
            await imageApi.toggleArchive(imageId);
            loadArchivedImages(); // Refresh the list
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to unarchive image');
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        try {
            await imageApi.deleteImage(imageId);
            loadArchivedImages(); // Refresh the list
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete image');
        }
    };

    const handleDownloadImage = async (imageId: number, filename: string) => {
        try {
            const response = await imageApi.downloadImage(imageId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to download image');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                📁 Archived Images
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {archivedImages.length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        No archived images
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Archive images to organize your collection
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {archivedImages.map((image) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={image.id}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={`http://localhost:8080/images/${image.id}/download`}
                                    alt={image.originalFilename}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardActions>
                                    <IconButton
                                        onClick={() => handleUnarchiveImage(image.id)}
                                        color="primary"
                                        title="Unarchive"
                                    >
                                        <Unarchive />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDownloadImage(image.id, image.originalFilename)}
                                        title="Download"
                                    >
                                        <Download />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDeleteImage(image.id)}
                                        title="Delete"
                                    >
                                        <Delete />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default Archive;

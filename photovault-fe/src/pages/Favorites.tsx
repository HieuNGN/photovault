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
import { Favorite, Download, Delete } from '@mui/icons-material';
import { imageApi } from '../services/api';
import { Image } from '../types/Image';

const Favorites: React.FC = () => {
    const [favorites, setFavorites] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const response = await imageApi.getFavorites();
            setFavorites(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFavorites();
    }, []);

    const handleRemoveFromFavorites = async (imageId: number) => {
        try {
            await imageApi.toggleFavorite(imageId);
            loadFavorites(); // Refresh the list
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to remove from favorites');
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
                ❤️ Favorite Images
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {favorites.length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        No favorite images yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Mark images as favorites from the home page to see them here
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {favorites.map((image) => (
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
                                        onClick={() => handleRemoveFromFavorites(image.id)}
                                        color="error"
                                    >
                                        <Favorite />
                                    </IconButton>
                                    <IconButton onClick={() => handleDownloadImage(image.id, image.originalFilename)}>
                                        <Download />
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

export default Favorites;
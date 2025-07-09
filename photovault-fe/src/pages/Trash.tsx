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
    CircularProgress,
    Button
} from '@mui/material';
import { Restore, DeleteForever, Download } from '@mui/icons-material';
import { imageApi } from '../services/api';
import { Image } from '../types/Image';

const Trash: React.FC = () => {
    const [trashedImages, setTrashedImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTrashedImages = async () => {
        try {
            setLoading(true);
            // We'll need to add this endpoint to the backend
            const response = await imageApi.getTrashedImages();
            setTrashedImages(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load trash');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrashedImages();
    }, []);

    const handleRestoreImage = async (imageId: number) => {
        try {
            await imageApi.restoreImage(imageId);
            loadTrashedImages(); // Refresh the list
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to restore image');
        }
    };

    const handlePermanentDelete = async (imageId: number) => {
        if (window.confirm('Are you sure? This will permanently delete the image and cannot be undone.')) {
            try {
                await imageApi.permanentlyDeleteImage(imageId);
                loadTrashedImages(); // Refresh the list
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to permanently delete image');
            }
        }
    };

    // might as well delete this function since who the hell wants to download from trash
    // const handleDownloadImage = async (imageId: number, filename: string) => {
    //     try {
    //         const response = await imageApi.downloadImage(imageId);
    //         const url = window.URL.createObjectURL(new Blob([response.data]));
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.setAttribute('download', filename);
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //         window.URL.revokeObjectURL(url);
    //     } catch (err: any) {
    //         setError(err.response?.data?.error || 'Failed to download image');
    //     }
    // };
    //
    // if (loading) {
    //     return (
    //         <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
    //             <CircularProgress />
    //         </Box>
    //     );
    // }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                🗑️ Trash
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {trashedImages.length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        Trash is empty
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Deleted images will appear here
                    </Typography>
                </Box>
            ) : (
                <>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Images in trash can be restored or permanently deleted.
                        Permanent deletion cannot be undone.
                    </Alert>

                    <Grid container spacing={3}>
                        {trashedImages.map((image) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={image.id}>
                                <Card sx={{ opacity: 0.7 }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={`http://localhost:8080/images/${image.id}/download`}
                                        alt={image.originalFilename}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardActions>
                                        <IconButton
                                            onClick={() => handleRestoreImage(image.id)}
                                            color="primary"
                                            title="Restore"
                                        >
                                            <Restore />
                                        </IconButton>
                                        {/*<IconButton*/}
                                        {/*    onClick={() => handleDownloadImage(image.id, image.originalFilename)}*/}
                                        {/*    title="Download"*/}
                                        {/*>*/}
                                        {/*    <Download />*/}
                                        {/*</IconButton>*/}
                                        <IconButton
                                            onClick={() => handlePermanentDelete(image.id)}
                                            color="error"
                                            title="Delete Forever"
                                        >
                                            <DeleteForever />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default Trash;

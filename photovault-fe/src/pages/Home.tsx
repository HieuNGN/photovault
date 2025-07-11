import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    // CardMedia,
    CardActions,
    IconButton,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    Alert,
    CircularProgress,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Favorite,
    FavoriteBorder,
    Delete,
    Archive,
    Add,
    Download,
    Search
} from '@mui/icons-material';
import { imageApi } from '../services/api';
import { Image } from '../types/Image';
import ImageUpload from '../components/ImageUploads/ImageUploads';
import ImageThumbnail from "../components/ImageThumbnail/ImageThumbnail";

const Home: React.FC = () => {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // remove unused filter
    // const [filteredImages, setFilteredImages] = useState<Image[]>([]);

    const useDebounce = (value: string, delay: number) => {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);

        return debouncedValue;
    };

    // use debounce searchquery
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // temp fix for the reloading loop
    // const loadImages = useCallback(async () => {
    //     try {
    //         setLoading(true);
    //         const response = await imageApi.getAllImages();
    //         setImages(response.data.content || response.data);
    //         setError(null);
    //     } catch (err: any) {
    //         setError(err.response?.data?.error || 'Failed to load images');
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);

    // temp fix for reloading loop
    // const loadImages = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await imageApi.getAllImages();
    //         setImages(response.data.content || response.data);
    //         setError(null);
    //     } catch (err: any) {
    //         setError(err.response?.data?.error || 'Failed to load images');
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    //
    // useEffect(() => {
    //     loadImages();
    // }, []); // Empty dependency array - runs only once on mountw

    // test an alternative way without using loadImages
    useEffect(() => {
        const fetchAllImages = async () => {
            try {
                setLoading(true);
                setError(null);

                let allImages: any[] = [];
                let page = 0;
                const pageSize = 100;
                let hasMore = true;

                while (hasMore) {
                    const response = await imageApi.getAllImages(page, pageSize);
                    const pageData = response.data.content || response.data || [];

                    if (pageData.length === 0 || pageData.length < pageSize) {
                        hasMore = false;
                    }

                    allImages = [...allImages, ...pageData];

                    // Update UI progressively
                    setImages([...allImages]);

                    // Optional: Add delay to prevent overwhelming the server
                    if (hasMore) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    page++;
                }

            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load images');
            } finally {
                setLoading(false);
            }
        };

        fetchAllImages();
    }, []);



    const filteredImages = useMemo(() => {
        if (debouncedSearchQuery.trim() === '') {
            return images;
        }
        return images.filter(image =>
            image.originalFilename.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
    }, [images, debouncedSearchQuery]);

    // replacing this as it causes flickers
    // useEffect(() => {
    //     loadImages();
    //     if (searchQuery.trim() === '') {
    //         setFilteredImages(images);
    //     } else {
    //         const filtered = images.filter(image =>
    //             image.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
    //         );
    //         setFilteredImages(filtered);
    //     }
    // }, [images, loadImages, searchQuery]);

    // replacing this to test alternative to loadImages
    // const handleToggleFavorite = useCallback(async (imageId: number) => {
    //     try {
    //         await imageApi.toggleFavorite(imageId);
    //         loadImages(); // Refresh the list
    //     } catch (err: any) {
    //         setError(err.response?.data?.error || 'Failed to update favorite');
    //     }
    // }, [loadImages]);
    //
    // const handleDeleteImage = useCallback(async (imageId: number) => {
    //     try {
    //         await imageApi.deleteImage(imageId);
    //         loadImages(); // Refresh the list
    //     } catch (err: any) {
    //         setError(err.response?.data?.error || 'Failed to delete image');
    //     }
    // }, [loadImages]);
    //
    // const handleUploadSuccess = useCallback(() => {
    //     setUploadDialogOpen(false);
    //     loadImages();
    // }, [loadImages]);
    //
    // const handleToggleArchive = useCallback(async (imageId: number) => {
    //     try {
    //         await imageApi.toggleArchive(imageId);
    //         loadImages(); // Refresh the list
    //     } catch (err: any) {
    //         setError(err.response?.data?.error || 'Failed to archive image');
    //     }
    // }, [loadImages]);

    const handleToggleFavorite = async (imageId: number) => {
        try {
            await imageApi.toggleFavorite(imageId);
            // Refresh images after action
            const response = await imageApi.getAllImages();
            setImages(response.data.content || response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update favorite');
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        try {
            await imageApi.deleteImage(imageId);
            // Refresh images after action
            const response = await imageApi.getAllImages();
            setImages(response.data.content || response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete image');
        }
    };

    const handleToggleArchive = async (imageId: number) => {
        try {
            await imageApi.toggleArchive(imageId);
            // Refresh images after action
            const response = await imageApi.getAllImages();
            setImages(response.data.content || response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to archive image');
        }
    };

    const handleUploadSuccess = () => {
        setUploadDialogOpen(false);
        // Refresh images after upload
        const fetchImages = async () => {
            try {
                const response = await imageApi.getAllImages();
                setImages(response.data.content || response.data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to refresh images');
            }
        };
        fetchImages();
    };

    // move the download handler for better access to modify the others
    const handleDownloadImage = useCallback(async (imageId: number, filename: string) => {
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
    }, []);

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
                My Images
            </Typography>

            <TextField
                fullWidth
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {images.length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        No images uploaded yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Click the + button to upload your first image
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredImages.map((image) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={image.id}>
                            <Card>
                                {/*<CardMedia*/}
                                {/*    component="img"*/}
                                {/*    height="200"*/}
                                {/*    image={`http://localhost:8080/images/${image.id}/download`}*/}
                                {/*    alt={image.originalFilename}*/}
                                {/*    sx={{ objectFit: 'cover' }}*/}
                                {/*/>*/}
                                <ImageThumbnail
                                    imageId={image.id}
                                    alt={image.originalFilename}
                                    width="100%"
                                    height={200}
                                    fallbackToRegular={true} // Fallback to regular download if thumbnail fails
                                />
                                <CardActions>
                                    <IconButton
                                        onClick={() => handleToggleFavorite(image.id)}
                                        color={image.isFavorite ? 'error' : 'default'}
                                    >
                                        {image.isFavorite ? <Favorite /> : <FavoriteBorder />}
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDownloadImage(image.id, image.originalFilename)}>
                                        <Download />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleToggleArchive(image.id)}>
                                    <Archive />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDeleteImage(image.id)}>
                                        <Delete />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Upload FAB */}
            <Fab
                color="primary"
                aria-label="upload"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => setUploadDialogOpen(true)}
            >
                <Add />
            </Fab>

            {/* Upload Dialog */}
            <Dialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Upload New Image</DialogTitle>
                <DialogContent>
                    <ImageUpload onUploadSuccess={handleUploadSuccess} />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Home;

// old post creation test blank page
// import React from 'react';
//
// const Home: React.FC = () => {
//     return (
//         <div>
//             <h1>Home Page</h1>
//             <p>Welcome to PhotoVault</p>
//         </div>
//     );
// };
//
// export default Home;



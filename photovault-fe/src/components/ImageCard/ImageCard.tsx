import React from 'react';
import { Card, CardMedia, CardActions, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder, Archive, Download, Delete } from '@mui/icons-material';
import { Image } from '../../types/Image';

interface ImageCardProps {
    image: Image;
    onToggleFavorite: (id: number) => void;
    onToggleArchive: (id: number) => void;
    onDownload: (id: number, filename: string) => void;
    onDelete: (id: number) => void;
}

const ImageCard: React.FC<ImageCardProps> = React.memo(({
                                                            image,
                                                            onToggleFavorite,
                                                            onToggleArchive,
                                                            onDownload,
                                                            onDelete
                                                        }) => {
    return (
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
                    onClick={() => onToggleFavorite(image.id)}
                    color={image.isFavorite ? 'error' : 'default'}
                >
                    {image.isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={() => onToggleArchive(image.id)}>
                    <Archive />
                </IconButton>
                <IconButton onClick={() => onDownload(image.id, image.originalFilename)}>
                    <Download />
                </IconButton>
                <IconButton onClick={() => onDelete(image.id)}>
                    <Delete />
                </IconButton>
            </CardActions>
        </Card>
    );
});

export default ImageCard;

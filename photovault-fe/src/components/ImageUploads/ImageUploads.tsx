import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, CircularProgress, Alert, LinearProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { imageApi } from '../../services/api';

interface ImageUploadProps {
    onUploadSuccess: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            await imageApi.uploadImage(file);
            setSuccess(`Successfully uploaded ${file.name}`);
            setTimeout(() => {
                onUploadSuccess();
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false
    });

    return (
        <Box sx={{ mb: 2 }}>
            <Box
                {...getRootProps()}
                sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragActive ? '#f5f5f5' : 'transparent',
                    '&:hover': {
                        backgroundColor: '#f9f9f9',
                    },
                }}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <Box>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography>Uploading...</Typography>
                        <LinearProgress sx={{ mt: 1 }} />
                    </Box>
                ) : (
                    <>
                        <CloudUpload sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            or click to select a file
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Supports: JPEG, PNG, GIF, WebP (max 10MB)
                        </Typography>
                    </>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                </Alert>
            )}
        </Box>
    );
};

export default ImageUpload;


// import React, { useCallback, useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { Box, Typography, CircularProgress, Alert } from '@mui/material';
// import { CloudUpload } from '@mui/icons-material';
// import { imageApi } from '../../services/api';
//
// interface ImageUploadProps {
//     onUploadSuccess: () => void;
// }
//
// const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess }) => {
//     const [uploading, setUploading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [success, setSuccess] = useState<string | null>(null);
//
//     const onDrop = useCallback(async (acceptedFiles: File[]) => {
//         const file = acceptedFiles[0];
//         if (!file) return;
//
//         setUploading(true);
//         setError(null);
//         setSuccess(null);
//
//         try {
//             await imageApi.uploadImage(file);
//             setSuccess(`Successfully uploaded ${file.name}`);
//             onUploadSuccess();
//         } catch (err: any) {
//             setError(err.response?.data?.error || 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     }, [onUploadSuccess]);
//
//     const { getRootProps, getInputProps, isDragActive } = useDropzone({
//         onDrop,
//         accept: {
//             'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
//         },
//         maxSize: 10 * 1024 * 1024, // 10MB
//         multiple: false
//     });
//
//     return (
//         <Box sx={{ mb: 4 }}>
//             <Box
//                 {...getRootProps()}
//                 sx={{
//                     border: '2px dashed #ccc',
//                     borderRadius: 2,
//                     p: 4,
//                     textAlign: 'center',
//                     cursor: 'pointer',
//                     backgroundColor: isDragActive ? '#f5f5f5' : 'transparent',
//                     '&:hover': {
//                         backgroundColor: '#f9f9f9',
//                     },
//                 }}
//             >
//                 <input {...getInputProps()} />
//                 {uploading ? (
//                     <CircularProgress />
//                 ) : (
//                     <>
//                         <CloudUpload sx={{ fontSize: 48, color: '#666', mb: 2 }} />
//                         <Typography variant="h6" gutterBottom>
//                             {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
//                         </Typography>
//                         <Typography variant="body2" color="textSecondary">
//                             or click to select a file
//                         </Typography>
//                         <Typography variant="caption" display="block" sx={{ mt: 1 }}>
//                             Supports: JPEG, PNG, GIF, WebP (max 10MB)
//                         </Typography>
//                     </>
//                 )}
//             </Box>
//
//             {error && (
//                 <Alert severity="error" sx={{ mt: 2 }}>
//                     {error}
//                 </Alert>
//             )}
//
//             {success && (
//                 <Alert severity="success" sx={{ mt: 2 }}>
//                     {success}
//                 </Alert>
//             )}
//         </Box>
//     );
// };
//
// export default ImageUpload;

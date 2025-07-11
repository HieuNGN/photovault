import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Button
    // FormControlLabel,
    // Switch
} from '@mui/material';
import { CloudUpload, CheckCircle, Error, Image as ImageIcon, Clear } from '@mui/icons-material';
import { imageApi } from '../../services/api';

interface ImageUploadProps {
    onUploadSuccess: () => void;
}

interface FileWithPreview extends File {
    preview?: string;
}

interface UploadResult {
    filename: string;
    status: 'success' | 'error';
    message?: string;
    error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess }) => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    // const [multipleMode, setMultipleMode] = useState(false);
    // const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const filesWithPreview = acceptedFiles.map(file =>
            Object.assign(file, {
                preview: URL.createObjectURL(file)
            })
        );

        // making multiple upload default
        // if (multipleMode) {
        //     setFiles(prev => [...prev, ...filesWithPreview]);
        // } else {
        //     setFiles(filesWithPreview.slice(0, 1)); // Only take first file in single mode
        // }
        // if (!file) return;

        setFiles(prev => [...prev, ...filesWithPreview]);
        // setUploading(true);
        setError(null);
        setSuccess(null);
        setUploadResults([]);
    }, []);

    const removeFile = (fileToRemove: FileWithPreview) => {
        setFiles(files => {
            const newFiles = files.filter(file => file !== fileToRemove);
            if (fileToRemove.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return newFiles;
        });
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setError(null);
        setSuccess(null);
        setUploadResults([]);
        // setUploadProgress(0);

        try {
            if (files.length === 1) {
                const response = await imageApi.uploadImage(files[0]);
                setSuccess(`Successfully uploaded ${files[0].name}`);
                setUploadResults([{
                    filename: files[0].name,
                    status: 'success'
                }]);
            } else {
                // Multiple file upload
                const response = await imageApi.uploadMultipleImagesWithProgress(files);
                const data = response.data;

                setSuccess(data.message);

                // Process results
                const results: UploadResult[] = [];
                data.results?.forEach((result: any) => {
                    results.push({
                        filename: result.filename,
                        status: result.status
                    });
                });

                data.errors?.forEach((error: any) => {
                    results.push({
                        filename: error.filename,
                        status: 'error',
                        error: error.error
                    });
                });

                setUploadResults(results);
            }
            // setting multiple as default
            //     if (data.successful > 0) {
            //         setTimeout(() => {
            //             onUploadSuccess();
            //             clearFiles();
            //         }, 2000);
            //     }
            // } else {
            //     // Single file upload
            //     const response = await imageApi.uploadImage(files[0]);
            //     setSuccess(`Successfully uploaded ${files[0].name}`);
            //     setUploadResults([{
            //         filename: files[0].name,
            //         status: 'success'
            //     }]);

            setTimeout(() => {
                onUploadSuccess();
                clearFiles();
            }, files.length === 1 ? 1000 : 2000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Upload failed';
            setError(errorMessage);
            setUploadResults([{
                filename: files[0]?.name || 'Unknown',
                status: 'error',
                error: errorMessage
            }]);
        } finally {
            setUploading(false);
            // setUploadProgress(0);
        }
    };

    const clearFiles = () => {
        files.forEach(file => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview);
            }
        });
        setFiles([]);
        setUploadResults([]);
        setError(null);
        setSuccess(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxSize: 10 * 1024 * 1024, // 10MB per file
        multiple: true //replace multipleMode with true to set default
    });

    // Cleanup on unmounting
    React.useEffect(() => {
        return () => {
            files.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [files]);

    // remove to implement multiple files upload
    //     try {
    //         await imageApi.uploadImage(file);
    //         setSuccess(`Successfully uploaded ${file.name}`);
    //         setTimeout(() => {
    //             onUploadSuccess();
    //         }, 1000);
    //     } catch (err: any) {
    //         setError(err.response?.data?.error || 'Upload failed');
    //     } finally {
    //         setUploading(false);
    //     }
    // }, [onUploadSuccess]);
    //
    // const { getRootProps, getInputProps, isDragActive } = useDropzone({
    //     onDrop,
    //     accept: {
    //         'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    //     },
    //     maxSize: 10 * 1024 * 1024, // 10MB
    //     multiple: false
    // });

    return (
        <Box sx={{ mb: 2 }}>
            {/* Multiple upload toggle, removed to set multi as default */}
            {/*<FormControlLabel*/}
            {/*    control={*/}
            {/*        <Switch*/}
            {/*            checked={multipleMode}*/}
            {/*            onChange={(e) => {*/}
            {/*                setMultipleMode(e.target.checked);*/}
            {/*                if (!e.target.checked && files.length > 1) {*/}
            {/*                    // Keep only the first file when switching to single mode*/}
            {/*                    const firstFile = files[0];*/}
            {/*                    files.slice(1).forEach(file => {*/}
            {/*                        if (file.preview) URL.revokeObjectURL(file.preview);*/}
            {/*                    });*/}
            {/*                    setFiles([firstFile]);*/}
            {/*                }*/}
            {/*            }}*/}
            {/*        />*/}
            {/*    }*/}
            {/*    label="Multiple file upload"*/}
            {/*    sx={{ mb: 2 }}*/}
            {/*/>*/}

            {/*drop zones*/}
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

            {/* File preview list */}
            {files.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Selected Files ({files.length})
                    </Typography>
                    <List dense>
                        {files.map((file, index) => (
                            <ListItem key={index} sx={{ pl: 0 }}>
                                <ListItemIcon>
                                    <ImageIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={file.name}
                                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                />
                                <Chip
                                    label={`${(file.size / 1024 / 1024).toFixed(1)}MB`}
                                    size="small"
                                    sx={{ mr: 1 }}
                                />
                                <Button
                                    size="small"
                                    onClick={() => removeFile(file)}
                                    disabled={uploading}
                                >
                                    <Clear />
                                </Button>
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={uploading || files.length === 0}
                        >
                            Upload {files.length > 1 ? `${files.length} Files` : 'File'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={clearFiles}
                            disabled={uploading}
                        >
                            Clear All
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Upload results */}
            {uploadResults.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Upload Results
                    </Typography>
                    <List dense>
                        {uploadResults.map((result, index) => (
                            <ListItem key={index} sx={{ pl: 0 }}>
                                <ListItemIcon>
                                    {result.status === 'success' ?
                                        <CheckCircle color="success" /> :
                                        <Error color="error" />
                                    }
                                </ListItemIcon>
                                <ListItemText
                                    primary={result.filename}
                                    secondary={result.error || 'Uploaded successfully'}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            {/*errors & success messages*/}
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

// old blank test
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

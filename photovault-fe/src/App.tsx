import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import Archive from './pages/Archive';
import Trash from './pages/Trash';

function App() {
  return (
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              📸 PhotoVault
            </Typography>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/favorites">Favorites</Button>
            <Button color="inherit" component={Link} to="/archive">Archive</Button>
            <Button color="inherit" component={Link} to="/trash">Trash</Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/trash" element={<Trash />} />
          </Routes>
        </Container>
      </Router>
  );
}

export default App;

// import React, { useState, useEffect } from 'react';
// import {
//   Container,
//   Typography,
//   Box,
//   Button,
//   Alert,
//   CircularProgress,
//   Paper,
//   Grid
// } from '@mui/material';
// import { CheckCircle, Error, Cloud } from '@mui/icons-material';
// import { imageApi } from './services/api';
//
//
// interface ConnectionStatus {
//   backend: 'loading' | 'success' | 'error';
//   message: string;
// }
//
// function App() {
//   const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
//     backend: 'loading',
//     message: 'Testing connection...'
//   });
//   const [stats, setStats] = useState<any>(null);
//   const [images, setImages] = useState<any>(null);
//
//   // Test backend connection
//   const testBackendConnection = async () => {
//     try {
//       setConnectionStatus({ backend: 'loading', message: 'Testing backend connection...' });
//       const response = await imageApi.testConnection();
//       setConnectionStatus({
//         backend: 'success',
//         message: `Backend connected: ${response.data}`
//       });
//     } catch (error: any) {
//       setConnectionStatus({
//         backend: 'error',
//         message: `Backend connection failed: ${error.message}`
//       });
//     }
//   };
//
//   // Test stats endpoint
//   const testStatsEndpoint = async () => {
//     try {
//       const response = await imageApi.getStats();
//       setStats(response.data);
//     } catch (error: any) {
//       console.error('Stats endpoint failed:', error);
//     }
//   };
//
//   // Test images endpoint
//   const testImagesEndpoint = async () => {
//     try {
//       const response = await imageApi.getAllImages();
//       setImages(response.data);
//     } catch (error: any) {
//       console.error('Images endpoint failed:', error);
//     }
//   };
//
//   // Test file upload
//   const testFileUpload = async () => {
//     // Create a small test image file
//     const canvas = document.createElement('canvas');
//     canvas.width = 100;
//     canvas.height = 100;
//     const ctx = canvas.getContext('2d');
//     if (ctx) {
//       ctx.fillStyle = '#4CAF50';
//       ctx.fillRect(0, 0, 100, 100);
//       ctx.fillStyle = 'white';
//       ctx.font = '16px Arial';
//       ctx.fillText('TEST', 30, 55);
//     }
//
//     canvas.toBlob(async (blob) => {
//       if (blob) {
//         const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
//         try {
//           const response = await imageApi.uploadImage(testFile);
//           alert(`Upload successful: ${JSON.stringify(response.data.message)}`);
//           // Refresh stats and images after upload
//           await testStatsEndpoint();
//           await testImagesEndpoint();
//         } catch (error: any) {
//           alert(`Upload failed: ${error.response?.data?.error || error.message}`);
//         }
//       }
//     }, 'image/png');
//   };
//
//   useEffect(() => {
//     testBackendConnection();
//     testStatsEndpoint();
//     testImagesEndpoint();
//   }, []);
//
//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'loading': return <CircularProgress size={20} />;
//       case 'success': return <CheckCircle color="success" />;
//       case 'error': return <Error color="error" />;
//       default: return null;
//     }
//   };
//
//   return (
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         <Typography variant="h3" component="h1" gutterBottom align="center">
//           📸 PhotoVault API Test
//         </Typography>
//
//         <Typography variant="subtitle1" align="center" color="textSecondary" sx={{ mb: 4 }}>
//           Testing connection between React frontend and Spring Boot backend
//         </Typography>
//
//         {/* Connection Status */}
//         <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
//           <Box display="flex" alignItems="center" gap={2}>
//             {getStatusIcon(connectionStatus.backend)}
//             <Typography variant="h6">Backend Connection</Typography>
//           </Box>
//           <Alert
//               severity={connectionStatus.backend === 'success' ? 'success' :
//                   connectionStatus.backend === 'error' ? 'error' : 'info'}
//               sx={{ mt: 2 }}
//           >
//             {connectionStatus.message}
//           </Alert>
//         </Paper>
//
//         {/* API Endpoints Test */}
//         <Grid container spacing={3}>
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Paper elevation={2} sx={{ p: 3 }}>
//               <Typography variant="h6" gutterBottom>
//                 📊 Stats Endpoint
//               </Typography>
//               {stats ? (
//                   <Box>
//                     <Typography>Total Images: {stats.totalImages}</Typography>
//                     <Typography>Favorites: {stats.favorites}</Typography>
//                     <Typography>Archived: {stats.archived}</Typography>
//                   </Box>
//               ) : (
//                   <Typography color="textSecondary">Loading stats...</Typography>
//               )}
//               <Button
//                   variant="outlined"
//                   onClick={testStatsEndpoint}
//                   sx={{ mt: 2 }}
//               >
//                 Refresh Stats
//               </Button>
//             </Paper>
//           </Grid>
//
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Paper elevation={2} sx={{ p: 3 }}>
//               <Typography variant="h6" gutterBottom>
//                 🖼️ Images Endpoint
//               </Typography>
//               {images ? (
//                   <Box>
//                     <Typography>
//                       Found: {images.totalElements || images.length || 0} images
//                     </Typography>
//                     <Typography variant="caption" color="textSecondary">
//                       {images.content ? 'Paginated response' : 'Simple array response'}
//                     </Typography>
//                   </Box>
//               ) : (
//                   <Typography color="textSecondary">Loading images...</Typography>
//               )}
//               <Button
//                   variant="outlined"
//                   onClick={testImagesEndpoint}
//                   sx={{ mt: 2 }}
//               >
//                 Refresh Images
//               </Button>
//             </Paper>
//           </Grid>
//
//           <Grid size={{ xs: 12 }}>
//             <Paper elevation={2} sx={{ p: 3 }}>
//               <Typography variant="h6" gutterBottom>
//                 ⬆️ Upload Test
//               </Typography>
//               <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
//                 This will create and upload a small test image to verify the upload endpoint.
//               </Typography>
//               <Button
//                   variant="contained"
//                   onClick={testFileUpload}
//                   startIcon={<Cloud />}
//                   disabled={connectionStatus.backend !== 'success'}
//               >
//                 Test Upload
//               </Button>
//             </Paper>
//           </Grid>
//         </Grid>
//
//         {/* Retry Connection */}
//         <Box textAlign="center" sx={{ mt: 4 }}>
//           <Button
//               variant="outlined"
//               onClick={testBackendConnection}
//               disabled={connectionStatus.backend === 'loading'}
//           >
//             Retry Connection Test
//           </Button>
//         </Box>
//       </Container>
//   );
// }
//
// export default App;
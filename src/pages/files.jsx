import React from 'react'
import FileUpload from '../components/FileUpload';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Grid,
  Container,
  Paper
} from '@mui/material';
import {
  FilePresent,
  CloudUpload,
  Info,
  NoteAdd
} from '@mui/icons-material';
import { useDarkMode } from '../contexts/DarkModeContext';

const Files = () => {
  const { isDarkMode } = useDarkMode();
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header Section */}
      <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            background: isDarkMode
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FilePresent sx={{ mr: 1 }} />
            <Typography variant="h5">File Management</Typography>
          </Box>
          <Typography variant="body2">
            Upload and manage files on the Cyberfly network
          </Typography>
        </Paper>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header Card */}
        <Card elevation={2}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    <NoteAdd sx={{ mr: 1 }} />
                    File Upload Center
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Upload files to the decentralized Cyberfly network for secure storage and sharing
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <CloudUpload sx={{ fontSize: 48, color: 'success.main', opacity: 0.7 }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* File Upload Component */}
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CloudUpload sx={{ mr: 1 }} />
              <Typography variant="h6">Upload Files</Typography>
            </Box>
            <FileUpload />
          </CardContent>
        </Card>

        {/* Information Section */}
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Info sx={{ mr: 1 }} />
              <Typography variant="h6">How It Works</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Decentralized File Storage</Typography>
                <Typography variant="body2">
                  Files uploaded to Cyberfly are stored across the decentralized network using IPFS and Libp2p protocols,
                  ensuring high availability and censorship resistance.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Supported File Types</Typography>
                <Typography variant="body2">
                  You can upload various file types including documents, images, videos, and archives.
                  Large files are automatically chunked for efficient transfer.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Security & Privacy</Typography>
                <Typography variant="body2">
                  All files are encrypted during transfer and can be shared with specific peers or made publicly accessible.
                  You maintain full control over your data.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ p: 1, borderRadius: 1, mr: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <FilePresent />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ mb: 0.5 }}>Key Features</Typography>
                <Typography variant="body2" color="text.secondary">
                  Discover the benefits of our file storage system
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
                  <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>Fast Upload</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Optimized chunking for large files
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
                  <Info sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>Secure Storage</Typography>
                  <Typography variant="body2" color="text.secondary">
                    End-to-end encryption and integrity checks
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
                  <NoteAdd sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>Easy Sharing</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Share files with peers or make public
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default Files
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  CheckCircle
} from '@mui/icons-material';
import { useDarkMode } from '../contexts/DarkModeContext';

const FileUpload = () => {
  const { isDarkMode } = useDarkMode();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setFiles([]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, [files]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Upload Area */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          border: '2px dashed',
          borderColor: dragOver
            ? 'primary.main'
            : isDarkMode
              ? 'rgba(255,255,255,0.2)'
              : 'rgba(0,0,0,0.2)',
          backgroundColor: dragOver
            ? (isDarkMode ? 'rgba(25,118,210,0.1)' : 'rgba(25,118,210,0.05)')
            : isDarkMode
              ? 'rgba(255,255,255,0.02)'
              : 'rgba(0,0,0,0.01)',
          borderRadius: 2,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: isDarkMode ? 'rgba(25,118,210,0.05)' : 'rgba(25,118,210,0.02)'
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input').click()}
      >
        <CloudUpload
          sx={{
            fontSize: 64,
            color: dragOver ? 'primary.main' : isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
            mb: 2
          }}
        />
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            color: isDarkMode ? '#ffffff' : '#1a1a1a'
          }}
        >
          {dragOver ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDarkMode ? '#b0b0b0' : '#666',
            mb: 2
          }}
        >
          or click to browse files
        </Typography>
        <Button
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          Choose Files
        </Button>
        <input
          id="file-input"
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </Paper>

      {/* File List */}
      {files.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: isDarkMode ? '#ffffff' : '#1a1a1a'
            }}
          >
            Selected Files ({files.length})
          </Typography>
          {files.map((file, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <InsertDriveFile sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      color: isDarkMode ? '#ffffff' : '#1a1a1a'
                    }}
                  >
                    {file.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode ? '#b0b0b0' : '#666'
                    }}
                  >
                    {formatFileSize(file.size)}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => removeFile(index)}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                <Delete />
              </IconButton>
            </Paper>
          ))}
        </Box>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              color: isDarkMode ? '#b0b0b0' : '#666'
            }}
          >
            Uploading... {uploadProgress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: 'primary.main'
              }
            }}
          />
        </Box>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploading && (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleUpload}
            startIcon={<CloudUpload />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Upload {files.length} File{files.length > 1 ? 's' : ''}
          </Button>
        </Box>
      )}

      {/* Success Message */}
      {uploadProgress === 100 && !uploading && (
        <Alert
          icon={<CheckCircle />}
          severity="success"
          sx={{
            mt: 2,
            borderRadius: 2
          }}
        >
          Files uploaded successfully to the Cyberfly network!
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;

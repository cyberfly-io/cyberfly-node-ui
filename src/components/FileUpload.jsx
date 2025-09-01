import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Card,
  CardContent,
  TextField,
  Tabs,
  Tab,
  Chip,
  Button,
  LinearProgress,
  Typography,
  Box,
  Input,
  IconButton,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  InsertDriveFile as FileIcon,
  MusicNote as MusicIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { getHost } from '../services/node-services';
import { signFileCID } from '../services/pact-services';
import { useDarkMode } from '../contexts/DarkModeContext';

const FileUpload = () => {
  const { isDarkMode } = useDarkMode();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [retrieveCid, setRetrieveCid] = useState('');
  const [retrieving, setRetrieving] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [tab, setTab] = useState(0);

  const [cid, setCid] = useState(null);

  // NEW: byte-accurate progress states
  const [uploadBytes, setUploadBytes] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadBytes, setDownloadBytes] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);
  const [downloadName, setDownloadName] = useState('');
  const [downloadBlobData, setDownloadBlobData] = useState(null);

  const fileInputRef = useRef(null);
  const CHUNK_SIZE = 800 * 1024; // 800KB chunks

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  useEffect(() => {
    // Get CID on component mount
    getCIDParam();
    if (cid) {
      setRetrieveCid(cid);
      setTab(1);
      setRetrieving(true);

      fetchAndRenderFile(cid).then(() => {
        setRetrieving(false);
      });
    }
  }, [cid]);

  const getCIDParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cidValue = urlParams.get('cid');
    setCid(cidValue);
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFileList([selectedFile]);
      setFile(selectedFile);
      setError('');
      setFileType(selectedFile.type);
      setUploadProgress(0);
      setUploadBytes(0);
    }
  };

  const removeFile = () => {
    setFileList([]);
    setFile(null);
    setUploadProgress(0);
    setUploadBytes(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadChunk = async (chunk, chunkIndex, totalChunks, fileName) => {
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('fileName', fileName);
    formData.append('chunkIndex', chunkIndex);
    formData.append('totalChunks', totalChunks);

    const host = getHost();
    const protocol = window.location.protocol;
    const url = `${protocol}//${host}/api/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Chunk ${chunkIndex} upload failed`);
    }

    return response.json();
  };

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadBytes(0);
      setError('');

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedBytes = 0;

      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await uploadChunk(chunk, chunkIndex, totalChunks, file.name);

        uploadedBytes += (end - start);
        setUploadBytes(uploadedBytes);
        const progress = (uploadedBytes / file.size) * 100;
        setUploadProgress(progress);
      }

      // Notify server that upload is complete
      const host = getHost();
      const protocol = window.location.protocol;
      const completeUrl = `${protocol}//${host}/api/upload/complete`;

      const completeResponse = await fetch(completeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          totalChunks,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      const result = await completeResponse.json();
      setUploadResult(result);
      setUploadProgress(100);
      setUploadBytes(file.size);
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [file]);

  const handleRetrieve = async () => {
    if (!retrieveCid.trim()) {
      setError('Please enter a CID');
      return;
    }

    try {
      setRetrieving(true);
      setError('');
      await fetchAndRenderFile(retrieveCid.trim());
    } catch (err) {
      setError('Failed to retrieve file');
    } finally {
      setRetrieving(false);
    }
  };

  const fetchAndRenderFile = async (cid) => {
    try {
      const protocol = window.location.protocol;
      const host = getHost();

      // First fetch metadata to get content type
      const metadataUrl = `${protocol}//${host}/api/metadata/${cid}`;
      const metadataResponse = await fetch(metadataUrl);

      if (!metadataResponse.ok) {
        throw new Error('Failed to fetch file metadata');
      }

      const metadata = await metadataResponse.json();
      setFileType(metadata.contentType);
      setDownloadName(metadata?.fileName || metadata?.filename || metadata?.name || cid);
      setDownloadBytes(0);
      setDownloadProgress(0);
      setDownloadTotal(Number(metadata?.size) || 0);

      // For video files, use streaming URL (progress not tracked for streaming)
      if (metadata.contentType.startsWith('video/')) {
        const streamUrl = `${protocol}//${host}/api/file/${cid}`;
        setFileContent(streamUrl);
        return;
      }

      // For other file types, fetch with progress
      const url = `${protocol}//${host}/api/file/${cid}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      // Try to extract filename from Content-Disposition header (if present)
      const cd = response.headers.get('Content-Disposition');
      if (cd) {
        const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
        const headerName = match ? decodeURIComponent(match[1] || match[2]) : null;
        if (headerName) setDownloadName(headerName);
      }

      const totalFromHeader = Number(response.headers.get('Content-Length')) || 0;
      const total = totalFromHeader || Number(metadata?.size) || 0;
      if (total) setDownloadTotal(total);

      // If stream is not readable, fallback to normal blob (no progress)
      if (!response.body || !response.body.getReader) {
        const blob = await response.blob();
        setDownloadBytes(blob.size || total);
        setDownloadProgress(100);
        setDownloadBlobData(blob);
        await handleBlobToViewer(blob, metadata.contentType);
        return;
      }

      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;

      // ReadableStream loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        setDownloadBytes(received);
        if (total) {
          setDownloadProgress((received / total) * 100);
        }
      }

      const blob = new Blob(chunks, { type: metadata.contentType || response.headers.get('Content-Type') || 'application/octet-stream' });
      if (!total) {
        setDownloadTotal(blob.size);
        setDownloadProgress(100);
      }
      setDownloadBlobData(blob);
      await handleBlobToViewer(blob, metadata.contentType);
    } catch (err) {
      setError('Failed to fetch file');
      setFileContent(null);
      setFileType(null);
      setDownloadProgress(0);
      setDownloadBytes(0);
      setDownloadTotal(0);
      setDownloadBlobData(null);
    }
  };

  // Helper to convert blob to appropriate viewer content
  const handleBlobToViewer = async (blob, mime) => {
    // Keep a copy of the blob for accurate downloads with filename
    try { setDownloadBlobData(blob); } catch {}
    if (mime === 'application/octet-stream') {
      setFileContent(blob);
      return;
    }
    if (mime?.startsWith('image/') || mime?.startsWith('audio/') || mime === 'application/pdf') {
      const mediaUrl = URL.createObjectURL(blob);
      setFileContent(mediaUrl);
      return;
    }
    if (mime?.startsWith('text/') || mime === 'application/json') {
      const text = await blob.text();
      setFileContent(text);
      return;
    }
    setFileContent(blob);
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      if (fileContent && typeof fileContent === 'string' && fileContent.startsWith('blob:')) {
        URL.revokeObjectURL(fileContent);
      }
    };
  }, [preview, fileContent]);

  // VideoPlayer component
  const VideoPlayer = ({ src, type }) => {
    const videoRef = useRef(null);
    const [isBuffering, setIsBuffering] = useState(false);
    const [error, setError] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleWaiting = () => setIsBuffering(true);
      const handlePlaying = () => setIsBuffering(false);
      const handleError = () => setError('Error loading video');
      const handleCanPlay = () => setLoaded(true);

      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('error', handleError);
      video.addEventListener('canplay', handleCanPlay);

      video.preload = 'metadata';

      return () => {
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('error', handleError);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }, []);

    return (
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
            <video
              ref={videoRef}
              controls
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#000'
              }}
              playsInline
            >
              <source src={src} type={type} />
              Your browser does not support the video tag.
            </video>

            {isBuffering && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  zIndex: 10
                }}
              >
                Buffering...
              </Box>
            )}

            {error && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(255,0,0,0.7)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  zIndex: 10
                }}
              >
                {error}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const FileViewer = ({ content, type }) => {
    if (!content) return null;

    if (type?.startsWith('audio/')) {
      return (
        <Card>
          <CardContent>
            <Stack direction="column" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
              <MusicIcon sx={{ width: 48, height: 48, color: 'grey.500' }} />
              <audio
                controls
                style={{ width: '100%' }}
                controlsList="nodownload"
              >
                <source src={content} type={type} />
                Your browser does not support the audio element.
              </audio>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                fullWidth
                onClick={() => downloadBlob(
                  downloadBlobData || new Blob([], { type }),
                  downloadName || 'audio'
                )}
              >
                Download Audio
              </Button>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    if (type?.startsWith('video/')) {
      return <VideoPlayer src={content} type={type} />;
    }

    if (type === 'application/octet-stream' ||
        (!type?.startsWith('image/') &&
         !type?.startsWith('text/') &&
         !type?.startsWith('video/') &&
         !type?.startsWith('audio/') &&
         type !== 'application/pdf' &&
         type !== 'application/json')) {
      return (
        <Card>
          <CardContent>
            <Stack direction="column" spacing={2} sx={{ width: '100%', alignItems: 'center', textAlign: 'center' }}>
              <FileIcon sx={{ width: 64, height: 64, color: 'grey.500' }} />
              <Box>
                <Typography variant="h6" gutterBottom>Binary File</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {downloadBlobData ? formatBytes(downloadBlobData.size) : '-'}
                </Typography>
                <Chip label={type || 'application/octet-stream'} color="primary" sx={{ mb: 2 }} />
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadBlob(downloadBlobData || content, downloadName || 'download')}
                  fullWidth
                >
                  Download File
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    if (type?.startsWith('image/')) {
      return (
        <Card>
          <CardContent>
            <img
              src={content}
              alt="Uploaded content"
              style={{ width: '100%', height: 'auto' }}
            />
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => downloadBlob(downloadBlobData, downloadName || 'image')}
              fullWidth
              sx={{ mt: 2 }}
            >
              Download Image
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (type === 'application/pdf') {
      return (
        <Card>
          <CardContent>
            <iframe
              src={content}
              title="PDF Viewer"
              style={{
                width: '100%',
                height: '600px',
                border: 'none'
              }}
            />
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => downloadBlob(downloadBlobData, downloadName || 'document.pdf')}
              fullWidth
              sx={{ mt: 2 }}
            >
              Download PDF
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (type?.startsWith('text/') || type === 'application/json') {
      return (
        <Card>
          <CardContent>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              fontFamily: 'monospace',
              background: '#f5f5f5',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '600px'
            }}>
              {content}
            </pre>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => downloadBlob(downloadBlobData, downloadName || 'text.txt')}
              fullWidth
              sx={{ mt: 2 }}
            >
              Download File
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <FileIcon sx={{ width: 64, height: 64, color: 'grey.500', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            This file type cannot be previewed
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const UploadTab = () => (
    <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
      <Box>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          fullWidth
          sx={{ py: 2 }}
        >
          Select File
        </Button>
      </Box>

      {file && (
        <Paper sx={{
          p: 2,
          bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'grey.50',
          color: isDarkMode ? '#ffffff' : 'inherit',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
          borderRadius: 2,
          boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <FileIcon color="primary" />
              <Typography variant="body1" fontWeight="bold" sx={{
                maxWidth: { xs: '220px', sm: '340px' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: isDarkMode ? '#fff' : 'inherit'
              }}>
                {file.name}
              </Typography>
              <Chip
                label={fileType || file.type || 'unknown'}
                size="small"
                sx={{
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)',
                  color: isDarkMode ? '#fff' : 'inherit'
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {formatBytes(file.size)}
              </Typography>
            </Stack>
            <IconButton onClick={removeFile} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Paper>
      )}

      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        fullWidth
        size="large"
      >
        {uploading ? 'Uploading...' : 'Start Upload'}
      </Button>
    </Stack>
  );

  const RetrieveTab = () => (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={0} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            placeholder="Enter CID to retrieve file"
            value={retrieveCid}
            onChange={(e) => setRetrieveCid(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRetrieve()}
            disabled={retrieving}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={handleRetrieve}
            disabled={retrieving || !retrieveCid.trim()}
            loading={retrieving}
            startIcon={<SearchIcon />}
            sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            {retrieving ? 'Retrieving...' : 'Retrieve'}
          </Button>
        </Stack>

        {(retrieving || downloadProgress > 0) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Downloading {downloadName || retrieveCid}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={downloadProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {formatBytes(downloadBytes)}{downloadTotal ? ` / ${formatBytes(downloadTotal)}` : ''}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        File Upload & Retrieval
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} aria-label="file tabs">
          <Tab label="Upload File" />
          <Tab label="Retrieve File" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 3 }}>
        {tab === 0 && (
          <Box>
            <UploadTab />
            {uploadProgress > 0 && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {formatBytes(uploadBytes)}{file ? ` / ${formatBytes(file.size)}` : ''}
                </Typography>
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
            {uploadResult && (
              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                  File uploaded successfully!
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
                  File link: {`${window.location.protocol}//${window.location.host}/files?cid=${uploadResult.metadataCid}`}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => copyToClipboard(`${window.location.protocol}//${window.location.host}/files?cid=${uploadResult.metadataCid}`)}
                  >
                    Copy Link
                  </Button>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => copyToClipboard(uploadResult.metadataCid)}
                  >
                    Copy CID
                  </Button>
                </Stack>
              </Alert>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <RetrieveTab />
            {fileContent && (
              <Box sx={{ mt: 3 }}>
                <FileViewer content={fileContent} type={fileType} />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FileUpload;

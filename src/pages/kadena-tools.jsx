import React, { useEffect, useState } from 'react';
import {
  Button, Card, CardContent, Typography, Box, Grid, Chip, Badge,
  Tabs, Tab, Alert, TextField, Tooltip, Modal, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TablePagination, Stack, useTheme, useMediaQuery,
  Snackbar, Alert as MuiAlert, IconButton, InputAdornment
} from '@mui/material';
import {
  VpnKey as KeyOutlined,
  ContentCopy as CopyOutlined,
  Download as DownloadOutlined,
  History as HistoryOutlined,
  CheckCircle as CheckCircleOutlined,
  Warning as ExclamationCircleOutlined,
  Info as InfoCircleOutlined,
  ElectricBolt as ThunderboltOutlined,
  Security as SafetyOutlined,
  Description as FileTextOutlined,
  Lock as LockOutlined,
  Visibility as EyeOutlined,
  VisibilityOff as EyeInvisibleOutlined,
  Add as PlusOutlined,
  Delete as DeleteOutlined
} from '@mui/icons-material';
import { genKeyPair } from '@kadena/cryptography-utils';
import { useDarkMode } from '../contexts/DarkModeContext';

const KadenaTools = () => {
  const { isDarkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [keypair, setKeypair] = useState(null);
  const [keypairs, setKeypairs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showPrivateKey, setShowPrivateKey] = useState({});
  const [keyStats, setKeyStats] = useState({
    totalKeys: 0,
    todayKeys: 0,
    lastGenerated: null
  });
  const [selectedKeypair, setSelectedKeypair] = useState(null);
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const showMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Load saved keypairs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kadenaKeypairs');
    const stats = localStorage.getItem('kadenaKeyStats');

    if (saved) {
      setKeypairs(JSON.parse(saved));
    }
    if (stats) {
      setKeyStats(JSON.parse(stats));
    }
  }, []);

  // Save keypairs to localStorage
  const saveKeypairs = (keys) => {
    setKeypairs(keys);
    localStorage.setItem('kadenaKeypairs', JSON.stringify(keys));
  };

  // Update statistics
  const updateStats = () => {
    const newStats = {
      totalKeys: keypairs.length,
      todayKeys: keypairs.filter(k => {
        const today = new Date().toDateString();
        return new Date(k.createdAt).toDateString() === today;
      }).length,
      lastGenerated: new Date().toISOString()
    };
    setKeyStats(newStats);
    localStorage.setItem('kadenaKeyStats', JSON.stringify(newStats));
  };

  function saveAsFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  const generateKeypair = () => {
    const newKeypair = genKeyPair();
    const keypairWithMeta = {
      ...newKeypair,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      label: `Key ${keypairs.length + 1}`,
    };

    const updated = [keypairWithMeta, ...keypairs];
    saveKeypairs(updated);
    setKeypair(keypairWithMeta);
    updateStats();

    // Auto-save to file
    saveAsFile(newKeypair.secretKey, `kadena-privatekey-${newKeypair.secretKey.substring(0, 8)}.txt`);
    showMessage('New keypair generated and saved!', 'success');
  };

  const copyToClipboard = (text, type = 'key') => {
    navigator.clipboard.writeText(text);
    showMessage(`${type === 'key' ? 'Private key' : 'Public key'} copied to clipboard!`, 'success');
  };

  const deleteKeypair = (id) => {
    const updated = keypairs.filter(k => k.id !== id);
    saveKeypairs(updated);
    showMessage('Keypair deleted successfully', 'success');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderTableRow = (record, index) => (
    <TableRow key={record.id} hover>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {record.label}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            wordBreak: 'break-all',
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' }
          }}
          onClick={() => copyToClipboard(record.publicKey, 'public')}
        >
          {record.publicKey.substring(0, 20)}...
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {new Date(record.createdAt).toLocaleDateString()}
        </Typography>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedKeypair(record);
              setKeyModalVisible(true);
            }}
            title="View Details"
          >
            <EyeOutlined />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => copyToClipboard(record.publicKey, 'public')}
            title="Copy Public Key"
          >
            <CopyOutlined />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => copyToClipboard(record.secretKey, 'private')}
            title="Copy Private Key"
          >
            <CopyOutlined />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => saveAsFile(record.secretKey, `kadena-privatekey-${record.label}.txt`)}
            title="Download Private Key"
          >
            <DownloadOutlined />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => deleteKeypair(record.id)}
            title="Delete Keypair"
          >
            <DeleteOutlined />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );

  const cardStyle = {
    background: isDarkMode
      ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    border: `1px solid ${isDarkMode ? '#404040' : '#e8e8e8'}`,
    borderRadius: '12px',
    boxShadow: isDarkMode
      ? '0 4px 20px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  };

  const statCardStyle = {
    ...cardStyle,
    textAlign: 'center',
    background: isDarkMode
      ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
      : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
    color: 'white'
  };

  return (
    <Box sx={{ padding: '24px' }}>
      {/* Header */}
      <Box
        sx={{
          padding: '16px 0',
          background: isDarkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          marginBottom: '24px',
          color: 'white'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 3 }}>
          <KeyOutlined />
          <Typography variant="h5">Kadena Tools</Typography>
        </Stack>
        <Typography variant="body2" sx={{ px: 3, mt: 1, opacity: 0.8 }}>
          Cryptographic key management and blockchain utilities
        </Typography>
      </Box>

      <Card sx={{
        borderRadius: '12px',
        boxShadow: isDarkMode
          ? '0 4px 12px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.1)',
        background: isDarkMode
          ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
      }}>
        <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab
            icon={<KeyOutlined />}
            iconPosition="start"
            label="Generate Keys"
            sx={{ minHeight: 48 }}
          />
          <Tab
            icon={<LockOutlined />}
            iconPosition="start"
            label={
              <Badge badgeContent={keypairs.length} color="primary">
                Manage Keys
              </Badge>
            }
            sx={{ minHeight: 48 }}
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Generate Keys Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: '8px',
                  boxShadow: 2,
                  height: '100%'
                }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <ThunderboltOutlined />
                      <Typography variant="h6">Generate New Keypair</Typography>
                    </Stack>
                    <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
                      <Typography variant="body2">
                        Generate a new cryptographic keypair for Kadena blockchain operations.
                        Your private key will be automatically saved to a file and stored locally.
                      </Typography>

                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight="bold">Security Notice</Typography>
                        <Typography variant="body2">
                          Keep your private keys secure and never share them. The generated keys are stored locally in your browser.
                        </Typography>
                      </Alert>

                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<KeyOutlined />}
                        onClick={generateKeypair}
                        fullWidth
                      >
                        Generate New Keypair
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: '8px',
                  boxShadow: 2,
                  height: '100%'
                }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <InfoCircleOutlined />
                      <Typography variant="h6">Keypair Information</Typography>
                    </Stack>
                    {keypair ? (
                      <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">Public Key:</Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              wordBreak: 'break-all',
                              bgcolor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              mt: 1,
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'grey.200' }
                            }}
                            onClick={() => copyToClipboard(keypair.publicKey, 'public')}
                          >
                            {keypair.publicKey}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" fontWeight="bold">Private Key:</Typography>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                                flex: 1
                              }}
                            >
                              {showPrivateKey[keypair.id] ?
                                keypair.secretKey :
                                `${keypair.secretKey.substring(0, 20)}...`
                              }
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => setShowPrivateKey(prev => ({
                                ...prev,
                                [keypair.id]: !prev[keypair.id]
                              }))}
                            >
                              {showPrivateKey[keypair.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </IconButton>
                          </Stack>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <Button
                            startIcon={<CopyOutlined />}
                            onClick={() => copyToClipboard(keypair.publicKey, 'public')}
                            size="small"
                          >
                            Copy Public
                          </Button>
                          <Button
                            startIcon={<CopyOutlined />}
                            onClick={() => copyToClipboard(keypair.secretKey, 'private')}
                            size="small"
                          >
                            Copy Private
                          </Button>
                          <Button
                            startIcon={<DownloadOutlined />}
                            onClick={() => saveAsFile(keypair.secretKey, `kadena-privatekey-${keypair.label}.txt`)}
                            size="small"
                          >
                            Download
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <KeyOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          No keypair generated yet
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Manage Keys Tab */}
          {activeTab === 1 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">Your Keypairs</Typography>
                <Button
                  variant="contained"
                  startIcon={<PlusOutlined />}
                  onClick={generateKeypair}
                >
                  Generate New
                </Button>
              </Stack>

              {keypairs.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">Label</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">Public Key</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">Created</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">Actions</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {keypairs
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((record, index) => renderTableRow(record, index))
                      }
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={keypairs.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <LockOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No keypairs found. Generate or import your first keypair.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Card>

      {/* Key Details Modal */}
      <Modal
        open={keyModalVisible}
        onClose={() => setKeyModalVisible(false)}
        maxWidth="md"
        fullWidth
      >
        <Dialog>
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <KeyOutlined />
              <Typography variant="h6">Keypair Details</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {selectedKeypair && (
              <Stack direction="column" spacing={3} sx={{ width: '100%', pt: 1 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Label</Typography>
                        <Typography variant="body1">{selectedKeypair.label}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Created</Typography>
                        <Typography variant="body1">
                          {new Date(selectedKeypair.createdAt).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Type</Typography>
                        <Chip
                          label={selectedKeypair.imported ? 'Imported' : 'Generated'}
                          color={selectedKeypair.imported ? 'warning' : 'success'}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6">Public Key</Typography>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(selectedKeypair.publicKey, 'public')}
                      >
                        <CopyOutlined />
                      </IconButton>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        bgcolor: 'grey.100',
                        p: 2,
                        borderRadius: 1
                      }}
                    >
                      {selectedKeypair.publicKey}
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6">Private Key</Typography>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => setShowPrivateKey(prev => ({
                            ...prev,
                            [selectedKeypair.id]: !prev[selectedKeypair.id]
                          }))}
                        >
                          {showPrivateKey[selectedKeypair.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(selectedKeypair.secretKey, 'private')}
                        >
                          <CopyOutlined />
                        </IconButton>
                      </Stack>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        bgcolor: 'grey.100',
                        p: 2,
                        borderRadius: 1
                      }}
                    >
                      {showPrivateKey[selectedKeypair.id] ?
                        selectedKeypair.secretKey :
                        `${selectedKeypair.secretKey.substring(0, 20)}...`
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setKeyModalVisible(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default KadenaTools
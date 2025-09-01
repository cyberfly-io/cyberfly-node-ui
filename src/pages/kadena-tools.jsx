import React, { useEffect, useState } from 'react';
import {
  Button, Card, CardContent, Typography, Box, Grid, Chip, Badge,
  Tabs, Tab, Alert, TextField, Tooltip, Modal, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TablePagination, Stack, useTheme, useMediaQuery,
  Snackbar, Alert as MuiAlert, IconButton, InputAdornment, Avatar
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
    <TableRow
      key={record.id}
      hover
      sx={{
        '&:hover': {
          bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          transform: 'scale(1.01)',
          transition: 'all 0.2s ease'
        },
        '& .MuiTableCell-root': {
          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
          color: isDarkMode ? '#e0e0e0' : 'inherit'
        }
      }}
    >
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: isDarkMode ? '#ffffff' : '#1a1a1a'
          }}
        >
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
            transition: 'all 0.2s ease',
            '&:hover': {
              color: isDarkMode ? '#40a9ff' : '#1976d2',
              textDecoration: 'underline'
            }
          }}
          onClick={() => copyToClipboard(record.publicKey, 'public')}
        >
          {isMobile ? record.publicKey.substring(0, 20) + '...' : record.publicKey.substring(0, 32) + '...'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            color: isDarkMode ? '#b0b0b0' : '#666'
          }}
        >
          {new Date(record.createdAt).toLocaleDateString()}
        </Typography>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedKeypair(record);
                setKeyModalVisible(true);
              }}
              sx={{
                bgcolor: isDarkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                color: '#1976d2',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <EyeOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy Public Key">
            <IconButton
              size="small"
              onClick={() => copyToClipboard(record.publicKey, 'public')}
              sx={{
                bgcolor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
                color: '#4caf50',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <CopyOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy Private Key">
            <IconButton
              size="small"
              onClick={() => copyToClipboard(record.secretKey, 'private')}
              sx={{
                bgcolor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
                color: '#ff9800',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <CopyOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Private Key">
            <IconButton
              size="small"
              onClick={() => saveAsFile(record.secretKey, `kadena-privatekey-${record.label}.txt`)}
              sx={{
                bgcolor: isDarkMode ? 'rgba(156, 39, 176, 0.1)' : 'rgba(156, 39, 176, 0.05)',
                color: '#9c27b0',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(156, 39, 176, 0.2)' : 'rgba(156, 39, 176, 0.1)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <DownloadOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Keypair">
            <IconButton
              size="small"
              color="error"
              onClick={() => deleteKeypair(record.id)}
              sx={{
                bgcolor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
                color: '#f44336',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );

  const cardStyle = {
    background: isDarkMode
      ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
    borderRadius: 4,
    boxShadow: isDarkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDarkMode
        ? '0 12px 40px rgba(0, 0, 0, 0.4)'
        : '0 12px 40px rgba(0, 0, 0, 0.15)'
    }
  };

  const statCardStyle = {
    ...cardStyle,
    textAlign: 'center',
    background: isDarkMode
      ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: 100,
      height: 100,
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      transform: 'translate(30px, -30px)',
    }
  };

  return (
    <Box sx={{
      padding: { xs: 2, sm: 3, md: 4 },
      minHeight: '100vh',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Enhanced Header */}
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 4 },
          mb: { xs: 3, md: 4 },
          background: isDarkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDarkMode
            ? '0 20px 60px rgba(0, 0, 0, 0.4)'
            : '0 20px 60px rgba(102, 126, 234, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 200,
            height: 200,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(50px, -50px)',
          }
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          position: 'relative',
          zIndex: 1
        }}>
          <Avatar
            sx={{
              mr: 2,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: 56,
              height: 56
            }}
          >
            <KeyOutlined sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              sx={{
                mb: 1,
                fontWeight: 700,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Kadena Tools
            </Typography>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.9,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              Generate and manage Kadena blockchain cryptographic keys
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Chip
            icon={<CheckCircleOutlined />}
            label="Secure Key Generation"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
          <Chip
            icon={<CheckCircleOutlined />}
            label="Local Storage"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
          <Chip
            icon={<CheckCircleOutlined />}
            label="Export Options"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
        </Box>
      </Paper>

      <Card sx={{
        borderRadius: 4,
        border: 'none',
        background: isDarkMode
          ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: isDarkMode
            ? 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
            : 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
        }
      }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            '& .MuiTab-root': {
              minHeight: { xs: 48, sm: 56 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              color: isDarkMode ? '#b0b0b0' : '#666',
              '&.Mui-selected': {
                color: isDarkMode ? '#ffffff' : '#1a1a1a',
                fontWeight: 700
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 2,
              background: isDarkMode
                ? 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                : 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
            }
          }}
        >
          <Tab
            icon={<KeyOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />}
            iconPosition="start"
            label="Generate Keys"
            sx={{ minHeight: { xs: 48, sm: 56 } }}
          />
          <Tab
            icon={<LockOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />}
            iconPosition="start"
            label={
              <Badge
                badgeContent={keypairs.length}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    minWidth: 20,
                    height: 20
                  }
                }}
              >
                Manage Keys
              </Badge>
            }
            sx={{ minHeight: { xs: 48, sm: 56 } }}
          />
        </Tabs>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Enhanced Generate Keys Tab */}
          {activeTab === 0 && (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} lg={6}>
                <Card sx={{
                  ...cardStyle,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: isDarkMode
                      ? 'rgba(76, 175, 80, 0.1)'
                      : 'rgba(76, 175, 80, 0.05)',
                    borderRadius: '50%',
                    transform: 'translate(30px, -30px)',
                  }
                }}>
                  <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: isDarkMode
                            ? 'rgba(76, 175, 80, 0.2)'
                            : 'rgba(76, 175, 80, 0.1)',
                          color: '#4caf50'
                        }}
                      >
                        <ThunderboltOutlined />
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a'
                        }}
                      >
                        Generate New Keypair
                      </Typography>
                    </Stack>
                    <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: isDarkMode ? '#b0b0b0' : '#666',
                          lineHeight: 1.6
                        }}
                      >
                        Generate a new cryptographic keypair for Kadena blockchain operations.
                        Your private key will be automatically saved to a file and stored locally.
                      </Typography>

                      <Alert
                        severity="warning"
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          '& .MuiAlert-icon': {
                            color: '#ff9800'
                          }
                        }}
                      >
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
                        sx={{
                          background: isDarkMode
                            ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
                            : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                          height: 56,
                          fontSize: '16px',
                          fontWeight: 700,
                          borderRadius: 3,
                          boxShadow: isDarkMode
                            ? '0 4px 16px rgba(46, 125, 50, 0.3)'
                            : '0 4px 16px rgba(67, 233, 123, 0.3)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            background: isDarkMode
                              ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                              : 'linear-gradient(135deg, #38f9d7 0%, #43e97b 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: isDarkMode
                              ? '0 8px 24px rgba(46, 125, 50, 0.4)'
                              : '0 8px 24px rgba(67, 233, 123, 0.4)'
                          }
                        }}
                      >
                        Generate New Keypair
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card sx={{
                  ...cardStyle,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: isDarkMode
                      ? 'rgba(25, 118, 210, 0.1)'
                      : 'rgba(25, 118, 210, 0.05)',
                    borderRadius: '50%',
                    transform: 'translate(30px, -30px)',
                  }
                }}>
                  <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: isDarkMode
                            ? 'rgba(25, 118, 210, 0.2)'
                            : 'rgba(25, 118, 210, 0.1)',
                          color: '#1976d2'
                        }}
                      >
                        <InfoCircleOutlined />
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a'
                        }}
                      >
                        Keypair Information
                      </Typography>
                    </Stack>
                    {keypair ? (
                      <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: isDarkMode ? '#ffffff' : '#1a1a1a',
                              mb: 1
                            }}
                          >
                            Public Key:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              wordBreak: 'break-all',
                              bgcolor: isDarkMode ? '#1e1e1e' : 'grey.100',
                              p: 2,
                              borderRadius: 2,
                              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: isDarkMode ? '#2d2d2d' : 'grey.200',
                                transform: 'translateY(-1px)'
                              }
                            }}
                            onClick={() => copyToClipboard(keypair.publicKey, 'public')}
                          >
                            {keypair.publicKey}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: isDarkMode ? '#ffffff' : '#1a1a1a',
                              mb: 1
                            }}
                          >
                            Private Key:
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                                bgcolor: isDarkMode ? '#1e1e1e' : 'grey.100',
                                p: 2,
                                borderRadius: 2,
                                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
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
                              sx={{
                                bgcolor: isDarkMode ? '#2d2d2d' : 'grey.200',
                                '&:hover': {
                                  bgcolor: isDarkMode ? '#3d3d3d' : 'grey.300'
                                }
                              }}
                            >
                              {showPrivateKey[keypair.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </IconButton>
                          </Stack>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button
                            startIcon={<CopyOutlined />}
                            onClick={() => copyToClipboard(keypair.publicKey, 'public')}
                            size="small"
                            variant="outlined"
                            fullWidth
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600
                            }}
                          >
                            Copy Public
                          </Button>
                          <Button
                            startIcon={<CopyOutlined />}
                            onClick={() => copyToClipboard(keypair.secretKey, 'private')}
                            size="small"
                            variant="outlined"
                            fullWidth
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600
                            }}
                          >
                            Copy Private
                          </Button>
                          <Button
                            startIcon={<DownloadOutlined />}
                            onClick={() => saveAsFile(keypair.secretKey, `kadena-privatekey-${keypair.label}.txt`)}
                            size="small"
                            variant="outlined"
                            fullWidth
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600
                            }}
                          >
                            Download
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <KeyOutlined sx={{ fontSize: 64, color: isDarkMode ? '#666' : 'text.secondary', mb: 2 }} />
                        <Typography
                          variant="body1"
                          sx={{
                            color: isDarkMode ? '#b0b0b0' : 'text.secondary',
                            fontWeight: 500
                          }}
                        >
                          No keypair generated yet
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode ? '#888' : 'text.secondary',
                            mt: 1
                          }}
                        >
                          Click "Generate New Keypair" to create your first key
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Enhanced Manage Keys Tab */}
          {activeTab === 1 && (
            <Box>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: isDarkMode ? '#ffffff' : '#1a1a1a'
                  }}
                >
                  Your Keypairs
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PlusOutlined />}
                  onClick={generateKeypair}
                  sx={{
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    '&:hover': {
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #311b92 0%, #1a237e 100%)'
                        : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                    }
                  }}
                >
                  Generate New
                </Button>
              </Stack>

              {keypairs.length > 0 ? (
                <TableContainer
                  component={Paper}
                  sx={{
                    maxHeight: 600,
                    borderRadius: 3,
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: isDarkMode
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{
                        '& .MuiTableCell-head': {
                          bgcolor: isDarkMode ? '#2d2d2d' : '#f5f5f5',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: isDarkMode ? '#ffffff' : '#1a1a1a',
                          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
                        }
                      }}>
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
                    sx={{
                      '& .MuiTablePagination-toolbar': {
                        color: isDarkMode ? '#b0b0b0' : '#666'
                      },
                      '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        color: isDarkMode ? '#b0b0b0' : '#666'
                      }
                    }}
                  />
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <LockOutlined sx={{
                    fontSize: 80,
                    color: isDarkMode ? '#666' : 'text.secondary',
                    mb: 3
                  }} />
                  <Typography
                    variant="h6"
                    sx={{
                      color: isDarkMode ? '#b0b0b0' : 'text.secondary',
                      fontWeight: 500,
                      mb: 2
                    }}
                  >
                    No keypairs found
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: isDarkMode ? '#888' : 'text.secondary',
                      mb: 4,
                      maxWidth: 400,
                      mx: 'auto'
                    }}
                  >
                    Generate or import your first keypair to get started with Kadena blockchain operations.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlusOutlined />}
                    onClick={generateKeypair}
                    size="large"
                    sx={{
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 600,
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      '&:hover': {
                        background: isDarkMode
                          ? 'linear-gradient(135deg, #311b92 0%, #1a237e 100%)'
                          : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                      }
                    }}
                  >
                    Generate Your First Keypair
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Card>

      {/* Enhanced Key Details Modal */}
      <Dialog
        open={keyModalVisible}
        onClose={() => setKeyModalVisible(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 4,
            maxWidth: { xs: '95vw', sm: '600px' },
            margin: { xs: 2, sm: 3 },
            background: isDarkMode
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isDarkMode
              ? '0 20px 60px rgba(0, 0, 0, 0.5)'
              : '0 20px 60px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
          <DialogTitle
            sx={{
              pb: 1,
              borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  bgcolor: isDarkMode
                    ? 'rgba(25, 118, 210, 0.2)'
                    : 'rgba(25, 118, 210, 0.1)',
                  color: '#1976d2'
                }}
              >
                <KeyOutlined />
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isDarkMode ? '#ffffff' : '#1a1a1a'
                }}
              >
                Keypair Details
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedKeypair && (
              <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
                <Card sx={{
                  background: isDarkMode
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode ? '#b0b0b0' : '#666',
                            fontWeight: 500,
                            mb: 1
                          }}
                        >
                          Label
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: isDarkMode ? '#ffffff' : '#1a1a1a'
                          }}
                        >
                          {selectedKeypair.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode ? '#b0b0b0' : '#666',
                            fontWeight: 500,
                            mb: 1
                          }}
                        >
                          Created
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: isDarkMode ? '#ffffff' : '#1a1a1a'
                          }}
                        >
                          {new Date(selectedKeypair.createdAt).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode ? '#b0b0b0' : '#666',
                            fontWeight: 500,
                            mb: 1
                          }}
                        >
                          Type
                        </Typography>
                        <Chip
                          label={selectedKeypair.imported ? 'Imported' : 'Generated'}
                          color={selectedKeypair.imported ? 'warning' : 'success'}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card sx={{
                  background: isDarkMode
                    ? 'rgba(76, 175, 80, 0.05)'
                    : 'rgba(76, 175, 80, 0.02)',
                  border: isDarkMode ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(76, 175, 80, 0.1)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a'
                        }}
                      >
                        Public Key
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(selectedKeypair.publicKey, 'public')}
                        sx={{
                          color: '#4caf50',
                          '&:hover': {
                            bgcolor: 'rgba(76, 175, 80, 0.1)'
                          }
                        }}
                      >
                        <CopyOutlined />
                      </IconButton>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        bgcolor: isDarkMode ? '#1e1e1e' : 'grey.100',
                        p: 2,
                        borderRadius: 2,
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                        fontSize: '0.875rem',
                        lineHeight: 1.5
                      }}
                    >
                      {selectedKeypair.publicKey}
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{
                  background: isDarkMode
                    ? 'rgba(255, 152, 0, 0.05)'
                    : 'rgba(255, 152, 0, 0.02)',
                  border: isDarkMode ? '1px solid rgba(255, 152, 0, 0.2)' : '1px solid rgba(255, 152, 0, 0.1)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a'
                        }}
                      >
                        Private Key
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => setShowPrivateKey(prev => ({
                            ...prev,
                            [selectedKeypair.id]: !prev[selectedKeypair.id]
                          }))}
                          sx={{
                            color: '#ff9800',
                            '&:hover': {
                              bgcolor: 'rgba(255, 152, 0, 0.1)'
                            }
                          }}
                        >
                          {showPrivateKey[selectedKeypair.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(selectedKeypair.secretKey, 'private')}
                          sx={{
                            color: '#ff9800',
                            '&:hover': {
                              bgcolor: 'rgba(255, 152, 0, 0.1)'
                            }
                          }}
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
                        bgcolor: isDarkMode ? '#1e1e1e' : 'grey.100',
                        p: 2,
                        borderRadius: 2,
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                        fontSize: '0.875rem',
                        lineHeight: 1.5
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
          <DialogActions sx={{
            p: 3,
            borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
          }}>
            <Button
              onClick={() => setKeyModalVisible(false)}
              variant="outlined"
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                px: 3
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbar-root': {
            top: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 }
          }
        }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            '& .MuiAlert-icon': {
              fontSize: '1.25rem'
            },
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default KadenaTools
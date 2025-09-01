import React, { useEffect, useState } from 'react'
import {
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Typography, Box, Grid, Chip, Avatar, Tooltip,
  TextField, InputAdornment, Divider, Stack, Paper, TablePagination,
  useTheme, useMediaQuery, CircularProgress, Container
} from '@mui/material'
import {
  Search as SearchOutlined,
  AccountTree as NodeIndexOutlined,
  Public as GlobalOutlined,
  Visibility as EyeOutlined,
  Refresh as ReloadOutlined,
  ElectricBolt as ThunderboltOutlined,
  Schedule as ClockCircleOutlined,
  EmojiEvents as CrownOutlined
} from '@mui/icons-material'
import { getActiveNodes } from '../services/pact-services';
import { getIPFromMultiAddr } from '../utils/utils';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const NodeList = () => {
  const [searchText, setSearchText] = useState('');
  const [nodes, setNodes] = useState([])
  const [filteredNodes, setFilteredNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    loadNodes()
  }, [])

  useEffect(() => {
    // Filter nodes based on search text
    if (searchText) {
      const filtered = nodes.filter(node =>
        node.peer_id?.toLowerCase().includes(searchText.toLowerCase()) ||
        getIPFromMultiAddr(node.multiaddr)?.toLowerCase().includes(searchText.toLowerCase()) ||
        node.status?.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredNodes(filtered)
    } else {
      setFilteredNodes(nodes)
    }
  }, [nodes, searchText])

  const loadNodes = () => {
    setLoading(true)
    getActiveNodes().then(data => {
      setNodes(data)
      setFilteredNodes(data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }

  const handleSearch = (value) => {
    setSearchText(value)
    setPage(0); // Reset to first page when searching
  }

  const handleReset = () => {
    setSearchText('')
    setPage(0);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'active':
        return 'success'
      case 'offline':
      case 'inactive':
        return 'error'
      case 'syncing':
        return 'warning'
      default:
        return 'default'
    }
  }

  const renderTableRow = (record, index) => (
    <TableRow
      key={record.peer_id}
      hover
      sx={{
        '&:hover': {
          backgroundColor: isDarkMode
            ? 'rgba(102, 126, 234, 0.1)'
            : 'rgba(102, 126, 234, 0.05)',
          transform: 'scale(1.01)',
          transition: 'all 0.2s ease-in-out'
        },
        '& .MuiTableCell-root': {
          borderBottom: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: record.status === 'active' || record.status === 'online'
                ? 'linear-gradient(135deg, #4caf50 0%, #43e97b 100%)'
                : record.status === 'syncing'
                ? 'linear-gradient(135deg, #ff9800 0%, #fa709a 100%)'
                : 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <NodeIndexOutlined fontSize="small" />
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{
                color: isDarkMode ? '#ffffff' : '#2c3e50',
                fontSize: '0.9rem'
              }}
            >
              {record.peer_id?.substring(0, 16)}...
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode ? '#b0b0b0' : '#7f8c8d',
                fontSize: '0.75rem'
              }}
            >
              {getIPFromMultiAddr(record.multiaddr)}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      {!isMobile && (
        <TableCell>
          <Chip
            label={record.status || 'Unknown'}
            color={getStatusColor(record.status)}
            size="small"
            sx={{
              fontWeight: 600,
              textTransform: 'capitalize',
              fontSize: '0.75rem'
            }}
          />
        </TableCell>
      )}
      {!isMobile && (
        <TableCell>
          <Tooltip title="Click to copy full address">
            <Typography
              variant="body2"
              sx={{
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'pointer',
                color: isDarkMode ? '#e0e0e0' : '#2c3e50',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                '&:hover': {
                  textDecoration: 'underline',
                  color: isDarkMode ? '#40a9ff' : '#1976d2'
                }
              }}
              onClick={() => navigator.clipboard.writeText(getIPFromMultiAddr(record.multiaddr))}
            >
              {getIPFromMultiAddr(record.multiaddr)}
            </Typography>
          </Tooltip>
        </TableCell>
      )}
      <TableCell>
        <Button
          variant="contained"
          size="small"
          startIcon={<EyeOutlined />}
          onClick={() => navigate(`/node/${record.peer_id}`)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            px: 2,
            py: 1,
            background: isDarkMode
              ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
              : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            '&:hover': {
              background: isDarkMode
                ? 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)'
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {isMobile ? 'View' : 'View Details'}
        </Button>
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: { xs: 2, sm: 3 }
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Enhanced Header */}
        <Box
          sx={{
            mb: { xs: 3, sm: 4 },
            p: { xs: 3, sm: 4 },
            background: isDarkMode
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 4,
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={{ xs: 2, sm: 3 }}
              sx={{ mb: { xs: 2, sm: 3 } }}
            >
              <Avatar
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <NodeIndexOutlined sx={{ fontSize: { xs: 24, sm: 28 } }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2.25rem' },
                    fontWeight: 700,
                    mb: 1
                  }}
                >
                  Network Nodes
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    opacity: 0.9,
                    fontWeight: 400
                  }}
                >
                  Monitor and manage active nodes in the Cyberfly network
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="outlined"
                startIcon={<ReloadOutlined />}
                onClick={loadNodes}
                disabled={loading}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Refresh Network
              </Button>
            </Stack>
          </Box>
        </Box>

      <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
        {/* Enhanced Statistics Overview */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                textAlign: 'center',
                background: isDarkMode
                  ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 4,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isDarkMode
                  ? '0 8px 32px rgba(26, 35, 126, 0.3)'
                  : '0 8px 32px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: isDarkMode
                    ? '0 12px 40px rgba(26, 35, 126, 0.4)'
                    : '0 12px 40px rgba(102, 126, 234, 0.4)'
                },
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
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
                  <NodeIndexOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 500
                    }}
                  >
                    Total Nodes
                  </Typography>
                </Stack>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    mb: 1
                  }}
                >
                  {nodes.length}
                </Typography>
                <Box
                  sx={{
                    width: '40px',
                    height: '3px',
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 2,
                    mx: 'auto'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                textAlign: 'center',
                background: isDarkMode
                  ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
                  : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                borderRadius: 4,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isDarkMode
                  ? '0 8px 32px rgba(46, 125, 50, 0.3)'
                  : '0 8px 32px rgba(67, 233, 123, 0.3)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: isDarkMode
                    ? '0 12px 40px rgba(46, 125, 50, 0.4)'
                    : '0 12px 40px rgba(67, 233, 123, 0.4)'
                },
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
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
                  <ThunderboltOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 500
                    }}
                  >
                    Active Nodes
                  </Typography>
                </Stack>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    mb: 1
                  }}
                >
                  {nodes.filter(n => n.status === 'active' || n.status === 'online').length}
                </Typography>
                <Box
                  sx={{
                    width: '40px',
                    height: '3px',
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 2,
                    mx: 'auto'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                textAlign: 'center',
                background: isDarkMode
                  ? 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
                  : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                borderRadius: 4,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isDarkMode
                  ? '0 8px 32px rgba(245, 124, 0, 0.3)'
                  : '0 8px 32px rgba(250, 112, 154, 0.3)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: isDarkMode
                    ? '0 12px 40px rgba(245, 124, 0, 0.4)'
                    : '0 12px 40px rgba(250, 112, 154, 0.4)'
                },
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
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
                  <SearchOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 500
                    }}
                  >
                    Filtered Results
                  </Typography>
                </Stack>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    mb: 1
                  }}
                >
                  {filteredNodes.length}
                </Typography>
                <Box
                  sx={{
                    width: '40px',
                    height: '3px',
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 2,
                    mx: 'auto'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                textAlign: 'center',
                background: isDarkMode
                  ? 'linear-gradient(135deg, #00695c 0%, #009688 100%)'
                  : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                color: 'white',
                borderRadius: 4,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isDarkMode
                  ? '0 8px 32px rgba(0, 105, 92, 0.3)'
                  : '0 8px 32px rgba(168, 237, 234, 0.3)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: isDarkMode
                    ? '0 12px 40px rgba(0, 105, 92, 0.4)'
                    : '0 12px 40px rgba(168, 237, 234, 0.4)'
                },
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
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
                  <GlobalOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 500
                    }}
                  >
                    Network Health
                  </Typography>
                </Stack>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    mb: 1
                  }}
                >
                  {nodes.length > 0 ? Math.round((nodes.filter(n => n.status === 'active' || n.status === 'online').length / nodes.length) * 100) : 0}%
                </Typography>
                <Box
                  sx={{
                    width: '40px',
                    height: '3px',
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 2,
                    mx: 'auto'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Search and Filters */}
        <Card
          sx={{
            borderRadius: 4,
            border: 'none',
            background: isDarkMode
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: isDarkMode
                ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                : '0 12px 40px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: isDarkMode
                    ? 'rgba(102, 126, 234, 0.2)'
                    : 'rgba(102, 126, 234, 0.1)',
                  color: isDarkMode ? '#667eea' : '#667eea'
                }}
              >
                <SearchOutlined />
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isDarkMode ? '#ffffff' : '#2c3e50'
                }}
              >
                Search & Filter
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8} lg={9}>
                <TextField
                  fullWidth
                  placeholder="Search by Peer ID, IP address, or status..."
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined sx={{ color: isDarkMode ? '#b0b0b0' : '#7f8c8d' }} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                      '& fieldset': {
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isDarkMode ? '#667eea' : '#667eea',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? '#ffffff' : '#2c3e50',
                      '&::placeholder': {
                        color: isDarkMode ? '#b0b0b0' : '#7f8c8d',
                        opacity: 0.8
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleReset}
                  disabled={!searchText}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    height: '56px',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    color: isDarkMode ? '#ffffff' : '#2c3e50',
                    '&:hover': {
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                    },
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  Clear Search
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Enhanced Nodes Table */}
        <Card
          sx={{
            borderRadius: 4,
            border: 'none',
            background: isDarkMode
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: isDarkMode
                ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                : '0 12px 40px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: isDarkMode
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(76, 175, 80, 0.1)',
                  color: '#4caf50'
                }}
              >
                <NodeIndexOutlined />
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isDarkMode ? '#ffffff' : '#2c3e50'
                }}
              >
                Active Nodes
              </Typography>
              <Chip
                label={`${filteredNodes.length} nodes`}
                color="primary"
                size="small"
                sx={{
                  fontWeight: 600,
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                    : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  color: 'white'
                }}
              />
            </Stack>

            {loading ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
                py: 4
              }}>
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <CircularProgress
                    size={80}
                    thickness={4}
                    sx={{
                      color: isDarkMode ? '#40a9ff' : '#1890ff'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      opacity: 0.3
                    }}
                  >
                    <NodeIndexOutlined sx={{ fontSize: 32 }} />
                  </Box>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: isDarkMode ? '#e0e0e0' : 'inherit',
                    fontWeight: 500,
                    mb: 1
                  }}
                >
                  Loading network nodes...
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    color: isDarkMode ? '#b0b0b0' : 'inherit',
                    textAlign: 'center'
                  }}
                >
                  Fetching node data and connection status
                </Typography>
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 600,
                  borderRadius: 3,
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  '& .MuiTableHead-root': {
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #333333 0%, #444444 100%)'
                      : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
                  },
                  '& .MuiTableRow-root:hover': {
                    backgroundColor: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          sx={{ color: isDarkMode ? '#ffffff' : '#2c3e50' }}
                        >
                          Node Info
                        </Typography>
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            sx={{ color: isDarkMode ? '#ffffff' : '#2c3e50' }}
                          >
                            Status
                          </Typography>
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            sx={{ color: isDarkMode ? '#ffffff' : '#2c3e50' }}
                          >
                            Network Address
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          sx={{ color: isDarkMode ? '#ffffff' : '#2c3e50' }}
                        >
                          Actions
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredNodes
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((record, index) => renderTableRow(record, index))
                    }
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredNodes.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    color: isDarkMode ? '#ffffff' : '#2c3e50',
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      color: isDarkMode ? '#b0b0b0' : '#7f8c8d'
                    },
                    '& .MuiTablePagination-select': {
                      color: isDarkMode ? '#ffffff' : '#2c3e50'
                    },
                    '& .MuiTablePagination-actions': {
                      color: isDarkMode ? '#ffffff' : '#2c3e50'
                    }
                  }}
                />
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Information Section */}
        <Card
          sx={{
            borderRadius: 4,
            border: 'none',
            background: isDarkMode
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: isDarkMode
                ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                : '0 12px 40px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: isDarkMode ? '#ffffff' : '#2c3e50',
                mb: 3
              }}
            >
              Node Information
            </Typography>
            <Stack direction="column" spacing={2}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{
                  color: isDarkMode ? '#ffffff' : '#2c3e50',
                  fontSize: '1rem'
                }}
              >
                Understanding Node Status:
              </Typography>
              <Box
                component="ul"
                sx={{
                  pl: 3,
                  m: 0,
                  '& li': {
                    mb: 1.5,
                    color: isDarkMode ? '#e0e0e0' : '#2c3e50'
                  }
                }}
              >
                <li>
                  <Chip
                    label="Active/Online"
                    color="success"
                    size="small"
                    sx={{ mr: 1, fontWeight: 600 }}
                  />
                  - Node is fully operational and responding
                </li>
                <li>
                  <Chip
                    label="Syncing"
                    color="warning"
                    size="small"
                    sx={{ mr: 1, fontWeight: 600 }}
                  />
                  - Node is synchronizing with the network
                </li>
                <li>
                  <Chip
                    label="Offline/Inactive"
                    color="error"
                    size="small"
                    sx={{ mr: 1, fontWeight: 600 }}
                  />
                  - Node is not responding or unreachable
                </li>
              </Box>
              <Divider
                sx={{
                  my: 2,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode ? '#b0b0b0' : '#7f8c8d',
                  lineHeight: 1.6
                }}
              >
                Click "View Details" to see comprehensive information about any node, including its configuration,
                performance metrics, and network connections.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
    </Box>
  )
}

export default NodeList
import React, { useEffect, useState } from 'react'
import {
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Typography, Box, Grid, Chip, Avatar, Tooltip,
  TextField, InputAdornment, Divider, Stack, Paper, TablePagination,
  useTheme, useMediaQuery, CircularProgress
} from '@mui/material'
import {
  Search as SearchOutlined,
  AccountTree as NodeIndexOutlined,
  Public as GlobalOutlined,
  Visibility as EyeOutlined,
  Refresh as ReloadOutlined
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
    <TableRow key={record.peer_id} hover>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: 'primary.main',
              fontSize: '16px'
            }}
          >
            <NodeIndexOutlined fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {record.peer_id?.substring(0, 16)}...
            </Typography>
            <Typography variant="caption" color="text.secondary">
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
            icon={<NodeIndexOutlined />}
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
                '&:hover': { textDecoration: 'underline' }
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
        >
          {isMobile ? 'View' : 'View Details'}
        </Button>
      </TableCell>
    </TableRow>
  );

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
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <NodeIndexOutlined />
            <Typography variant="h5">Network Nodes</Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<ReloadOutlined />}
            onClick={loadNodes}
            disabled={loading}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Refresh
          </Button>
        </Stack>
        <Typography variant="body2" sx={{ px: 3, mt: 1, opacity: 0.8 }}>
          Monitor and manage active nodes in the Cyberfly network
        </Typography>
      </Box>

      <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
        {/* Statistics Overview */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <NodeIndexOutlined color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Nodes</Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {nodes.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <GlobalOutlined color="success" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Active Nodes</Typography>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {nodes.filter(n => n.status === 'active' || n.status === 'online').length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <SearchOutlined color="warning" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Filtered Results</Typography>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {filteredNodes.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <NodeIndexOutlined color="secondary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Network Health</Typography>
                    <Typography variant="h4" color="secondary.main" fontWeight="bold">
                      {nodes.length > 0 ? Math.round((nodes.filter(n => n.status === 'active' || n.status === 'online').length / nodes.length) * 100) : 0}%
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <SearchOutlined />
              <Typography variant="h6">Search & Filter</Typography>
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
                        <SearchOutlined />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleReset}
                  disabled={!searchText}
                  size="large"
                >
                  Clear Search
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Nodes Table */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <NodeIndexOutlined />
              <Typography variant="h6">Active Nodes</Typography>
              <Chip label={`${filteredNodes.length} nodes`} color="primary" size="small" />
            </Stack>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>Loading nodes...</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">Node Info</Typography></TableCell>
                      {!isMobile && <TableCell><Typography variant="subtitle2" fontWeight="bold">Status</Typography></TableCell>}
                      {!isMobile && <TableCell><Typography variant="subtitle2" fontWeight="bold">Network Address</Typography></TableCell>}
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">Actions</Typography></TableCell>
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
                />
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Information Section */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Node Information</Typography>
            <Stack direction="column" spacing={1}>
              <Typography variant="subtitle2" fontWeight="bold">Understanding Node Status:</Typography>
              <Box component="ul" sx={{ pl: 3, m: 0 }}>
                <li><Chip label="Active/Online" color="success" size="small" sx={{ mr: 1 }} /> - Node is fully operational and responding</li>
                <li><Chip label="Syncing" color="warning" size="small" sx={{ mr: 1 }} /> - Node is synchronizing with the network</li>
                <li><Chip label="Offline/Inactive" color="error" size="small" sx={{ mr: 1 }} /> - Node is not responding or unreachable</li>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Click "View Details" to see comprehensive information about any node, including its configuration,
                performance metrics, and network connections.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}

export default NodeList
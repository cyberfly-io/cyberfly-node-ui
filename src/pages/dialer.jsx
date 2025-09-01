import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Container,
  Snackbar
} from '@mui/material'
import {
  Wifi,
  ElectricBolt,
  Search,
  CheckCircle,
  Cancel,
  Hub,
  Storage
} from '@mui/icons-material'
import { dialNode, findPeer } from '../services/node-services'
import ReactJson from 'react-json-view'
import { useDarkMode } from '../contexts/DarkModeContext'
import { getNode } from '../services/pact-services'

const Dialer = () => {
  const [peerInfo, setPeerInfo] = useState(null)
  const [nodeInfo, setNodeInfo] = useState(null)
  const [loadingDial, setLoadingDial] = useState(false)
  const [loadingPeer, setLoadingPeer] = useState(false)
  const [dialStatus, setDialStatus] = useState(null)
  const [peerStatus, setPeerStatus] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const { isDarkMode } = useDarkMode()

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const onFinish = async (values) => {
    console.log('Received values:', values)
    setLoadingDial(true)
    setDialStatus('loading')

    try {
      const data = await dialNode(values.multiaddr)
      console.log(data)
      setDialStatus('success')
      showSnackbar('Connection Test Successful', 'success')
    } catch (error) {
      setDialStatus('error')
      showSnackbar('Connection Test Failed: Unable to establish connection to the provided multi-address', 'error')
    } finally {
      setLoadingDial(false)
    }
  }

  const onFindPeer = async (values) => {
    console.log('Received values:', values)
    setLoadingPeer(true)
    setPeerStatus('loading')

    try {
      // Get node info from pact services
      const nodeRes = await getNode(values.peerId)
      setNodeInfo(nodeRes)

      // Get peer info from node services
      const peerData = await findPeer(values.peerId)
      setPeerInfo(peerData)

      setPeerStatus('success')
      showSnackbar(`Peer Found Successfully: ${values.peerId.slice(0, 20)}...`, 'success')
    } catch (error) {
      setPeerStatus('error')
      setPeerInfo(null)
      setNodeInfo(null)
      showSnackbar('Peer Not Found: Unable to find the specified peer or retrieve node information', 'error')
    } finally {
      setLoadingPeer(false)
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const clearResults = () => {
    setPeerInfo(null);
    setNodeInfo(null);
    setDialStatus(null);
    setPeerStatus(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        sx={{
          p: 3,
          mb: 3,
          background: (theme) => isDarkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          color: 'white'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Network Connection Tools
            </Typography>
            <Typography variant="body1">
              Test multi-address connections and find network peers
            </Typography>
          </Box>
          {(peerInfo || nodeInfo) && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={clearResults}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Clear Results
            </Button>
          )}
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Stack spacing={3}>
        <Grid container spacing={3}>
          {/* Multi-Address Connection Test */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: (theme) => theme.shadows[isDarkMode ? 3 : 1],
                height: '100%'
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <ElectricBolt color="primary" />
                  <Typography variant="h6" component="div">
                    Connection Test
                  </Typography>
                  {dialStatus && (
                    <Chip
                      label={
                        dialStatus === 'success' ? 'Connected' :
                        dialStatus === 'error' ? 'Failed' : 'Testing...'
                      }
                      color={
                        dialStatus === 'success' ? 'success' :
                        dialStatus === 'error' ? 'error' : 'warning'
                      }
                      icon={
                        dialStatus === 'success' ? <CheckCircle /> :
                        dialStatus === 'error' ? <Cancel /> :
                        <CircularProgress size={16} />
                      }
                      size="small"
                    />
                  )}
                </Stack>
                <Box component="form" onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  onFinish({ multiaddr: formData.get('multiaddr') })
                }}>
                  <TextField
                    fullWidth
                    label="Multi-Address"
                    name="multiaddr"
                    placeholder="Enter multi-address to test connection"
                    variant="outlined"
                    size="medium"
                    required
                    InputProps={{
                      startAdornment: <ElectricBolt sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loadingDial}
                    startIcon={loadingDial ? <CircularProgress size={20} /> : <ElectricBolt />}
                    sx={{
                      height: 48,
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)'
                      }
                    }}
                  >
                    {loadingDial ? 'Testing Connection...' : 'Test Connection'}
                  </Button>
                </Box>

                {dialStatus === 'success' && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Connection Successful - The multi-address is reachable and responding correctly.
                  </Alert>
                )}

                {dialStatus === 'error' && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Connection Failed - Unable to establish connection. Please check the multi-address and try again.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Peer Discovery */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: (theme) => theme.shadows[isDarkMode ? 3 : 1],
                height: '100%'
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Search color="primary" />
                  <Typography variant="h6" component="div">
                    Peer Discovery
                  </Typography>
                  {peerStatus && (
                    <Chip
                      label={
                        peerStatus === 'success' ? 'Found' :
                        peerStatus === 'error' ? 'Not Found' : 'Searching...'
                      }
                      color={
                        peerStatus === 'success' ? 'success' :
                        peerStatus === 'error' ? 'error' : 'warning'
                      }
                      icon={
                        peerStatus === 'success' ? <CheckCircle /> :
                        peerStatus === 'error' ? <Cancel /> :
                        <CircularProgress size={16} />
                      }
                      size="small"
                    />
                  )}
                </Stack>
                <Box component="form" onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  onFindPeer({ peerId: formData.get('peerId') })
                }}>
                  <TextField
                    fullWidth
                    label="Peer ID"
                    name="peerId"
                    placeholder="Enter peer ID to search"
                    variant="outlined"
                    size="medium"
                    required
                    InputProps={{
                      startAdornment: <Hub sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loadingPeer}
                    startIcon={loadingPeer ? <CircularProgress size={20} /> : <Search />}
                    sx={{
                      height: 48,
                      background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)'
                      }
                    }}
                  >
                    {loadingPeer ? 'Searching...' : 'Find Peer'}
                  </Button>
                </Box>

                {peerStatus === 'success' && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Peer Found Successfully - Found peer and node information.
                  </Alert>
                )}

                {peerStatus === 'error' && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Peer Not Found - The specified peer ID could not be found in the network.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Results Section */}
        {(peerInfo || nodeInfo) && (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: (theme) => theme.shadows[isDarkMode ? 3 : 1]
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Storage color="primary" />
                <Typography variant="h6" component="div">
                  Query Results
                </Typography>
              </Stack>

              <Stack spacing={3}>
                {peerInfo && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Hub />
                      Peer Information
                    </Typography>
                    <Card
                      variant="outlined"
                      sx={{
                        backgroundColor: (theme) => isDarkMode ? '#1f1f1f' : '#fafafa',
                        borderRadius: 2
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <ReactJson
                          src={peerInfo}
                          theme={isDarkMode ? 'apathy' : 'apathy:inverted'}
                          style={{ fontSize: '12px' }}
                        />
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {nodeInfo && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Storage />
                      Node Information
                    </Typography>
                    <Card
                      variant="outlined"
                      sx={{
                        backgroundColor: (theme) => isDarkMode ? '#1f1f1f' : '#fafafa',
                        borderRadius: 2
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <ReactJson
                          src={nodeInfo}
                          theme={isDarkMode ? 'apathy' : 'apathy:inverted'}
                          style={{ fontSize: '12px' }}
                        />
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!peerInfo && !nodeInfo && !loadingDial && !loadingPeer && (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: (theme) => theme.shadows[isDarkMode ? 3 : 1],
              textAlign: 'center'
            }}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  No results yet
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Use the tools above to test connections or find peers
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  )
}

export default Dialer
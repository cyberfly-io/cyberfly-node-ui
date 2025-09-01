import React, { useEffect, useState } from 'react'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  CircularProgress,
  Backdrop,
  Chip,
  Divider,
  Button,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  Snackbar,
  Alert
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Public as PublicIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  Hub as HubIcon,
  Bolt as FlashIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material'
import { getNode } from '../services/pact-services'
import { getNodeInfo } from '../services/node-services'
import { useDarkMode } from '../contexts/DarkModeContext';
import GradientHeader from '../components/GradientHeader';

const Settings = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [nodeInfo, setNodeInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [networkNode, setNetworkNode] = useState(null)
  const [settings, setSettings] = useState({
    theme: isDarkMode ? 'dark' : 'light',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 5000
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(()=>{
    loadNodeInfo()
  },[])

  useEffect(()=>{
   if(nodeInfo){
    getNode(nodeInfo.peerId).then((data)=>{
      setNetworkNode(data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
   }
  }, [nodeInfo])

  const loadNodeInfo = () => {
    setLoading(true)
    getNodeInfo().then((data)=>{
     setNodeInfo(data)
    }).catch(() => {
      setLoading(false)
    })
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))

    if (key === 'theme') {
      if (value === 'dark' && !isDarkMode) {
        toggleDarkMode()
      } else if (value === 'light' && isDarkMode) {
        toggleDarkMode()
      }
    }
  }

  const saveSettings = () => {
    // Here you would typically save to localStorage or backend
    localStorage.setItem('cyberfly-settings', JSON.stringify(settings))
    setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
          background: isDarkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0, flex: 1 }}>
            <SettingsIcon fontSize="large" />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                Settings
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                Configure your node and application preferences
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadNodeInfo}
              disabled={loading}
              sx={{
                color: 'white',
                borderColor: 'white',
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                px: { xs: 1, md: 2 },
                py: { xs: 0.5, md: 1 },
                minWidth: 'auto'
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Refresh</Box>
              <RefreshIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveSettings}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                px: { xs: 1, md: 2 },
                py: { xs: 0.5, md: 1 },
                minWidth: 'auto'
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Save</Box>
              <SaveIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Backdrop open={loading} sx={{ color: '#fff', zIndex: 9999 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="inherit" />
          <Typography variant="h6">Loading settings...</Typography>
        </Stack>
      </Backdrop>
      {/* Node Information Section */}
      <Card elevation={2} sx={{ mb: { xs: 2, md: 3 } }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: { xs: 2, md: 3 } }}>
            <HubIcon color="primary" />
            <Typography variant="h5" component="h2" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
              Node Information
            </Typography>
          </Stack>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} sm={6} lg={4}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <HubIcon color="action" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>Peer ID</Typography>
                </Stack>
                <Typography variant="body1" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '1rem' }, wordBreak: 'break-all' }}>
                  {nodeInfo?.peerId ? `${nodeInfo.peerId.substring(0, 12)}...` : 'Not available'}
                </Typography>
                {nodeInfo?.peerId && (
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => navigator.clipboard.writeText(nodeInfo.peerId)}
                    sx={{ textTransform: 'none', fontSize: { xs: '0.75rem', md: '0.875rem' }, px: { xs: 1, md: 2 } }}
                  >
                    Copy full peer ID
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <PersonIcon color="action" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>Node Owner</Typography>
                </Stack>
                <Typography variant="body1" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '1rem' }, wordBreak: 'break-all' }}>
                  {nodeInfo?.account ? `${nodeInfo.account.substring(0, 12)}...` : 'Not available'}
                </Typography>
                {nodeInfo?.account && (
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => navigator.clipboard.writeText(nodeInfo.account)}
                    sx={{ textTransform: 'none', fontSize: { xs: '0.75rem', md: '0.875rem' }, px: { xs: 1, md: 2 } }}
                  >
                    Copy full account
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <FlashIcon color="action" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>Version</Typography>
                </Stack>
                <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                  {nodeInfo?.version || 'Unknown'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {networkNode && (
            <>
              <Divider sx={{ my: { xs: 2, md: 3 } }} />
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={6} sm={3} lg={3}>
                  <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                      <PublicIcon color="action" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.875rem', md: '1.25rem' }, textAlign: 'center' }}>
                        Connected Peers
                      </Typography>
                    </Stack>
                    <Typography variant="h4" color="primary" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                      {networkNode.connected || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3} lg={3}>
                  <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                      <ApiIcon color="action" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.875rem', md: '1.25rem' }, textAlign: 'center' }}>
                        Discovered Peers
                      </Typography>
                    </Stack>
                    <Typography variant="h4" color="primary" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                      {networkNode.discovered || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3} lg={3}>
                  <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                      <StorageIcon color="action" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.875rem', md: '1.25rem' }, textAlign: 'center' }}>
                        Active Stakes
                      </Typography>
                    </Stack>
                    <Typography variant="h4" color="primary" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                      {networkNode.stakes || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3} lg={3}>
                  <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                      <FlashIcon color="success" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.875rem', md: '1.25rem' }, textAlign: 'center' }}>
                        Network Status
                      </Typography>
                    </Stack>
                    <Chip
                      label="Online"
                      color="success"
                      variant="outlined"
                      sx={{ mt: 1, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card elevation={2} sx={{ mb: { xs: 2, md: 3 } }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: { xs: 2, md: 3 } }}>
            <SettingsIcon color="primary" />
            <Typography variant="h5" component="h2" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
              Application Settings
            </Typography>
          </Stack>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  label="Theme"
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                >
                  <MenuItem value="light" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Light</MenuItem>
                  <MenuItem value="dark" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Dark</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                  Notifications
                </Typography>
                <Switch
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                  Auto Refresh
                </Typography>
                <Switch
                  checked={settings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <FormControl fullWidth size="small" disabled={!settings.autoRefresh}>
                <InputLabel sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Refresh Interval</InputLabel>
                <Select
                  value={settings.refreshInterval}
                  label="Refresh Interval"
                  onChange={(e) => handleSettingChange('refreshInterval', e.target.value)}
                  disabled={!settings.autoRefresh}
                  sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                >
                  <MenuItem value={2000} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>2 seconds</MenuItem>
                  <MenuItem value={5000} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>5 seconds</MenuItem>
                  <MenuItem value={10000} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>10 seconds</MenuItem>
                  <MenuItem value={30000} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>30 seconds</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card elevation={2}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
            System Information
          </Typography>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>Browser</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, wordBreak: 'break-word' }}>
                  {navigator.userAgent.split(' ').pop()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>Platform</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, wordBreak: 'break-word' }}>
                  {navigator.platform}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>Language</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                  {navigator.language}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>Online</Typography>
                <Chip
                  label={navigator.onLine ? 'Yes' : 'No'}
                  color={navigator.onLine ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default Settings
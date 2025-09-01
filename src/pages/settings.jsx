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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: isDarkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <SettingsIcon fontSize="large" />
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Settings
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                Configure your node and application preferences
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadNodeInfo}
              disabled={loading}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveSettings}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              Save Settings
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
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <HubIcon color="primary" />
            <Typography variant="h5" component="h2" fontWeight="bold">
              Node Information
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={4}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <HubIcon color="action" />
                  <Typography variant="h6">Peer ID</Typography>
                </Stack>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {nodeInfo?.peerId ? `${nodeInfo.peerId.substring(0, 12)}...` : 'Not available'}
                </Typography>
                {nodeInfo?.peerId && (
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => navigator.clipboard.writeText(nodeInfo.peerId)}
                    sx={{ textTransform: 'none' }}
                  >
                    Copy full peer ID
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <PersonIcon color="action" />
                  <Typography variant="h6">Node Owner</Typography>
                </Stack>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {nodeInfo?.account ? `${nodeInfo.account.substring(0, 12)}...` : 'Not available'}
                </Typography>
                {nodeInfo?.account && (
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => navigator.clipboard.writeText(nodeInfo.account)}
                    sx={{ textTransform: 'none' }}
                  >
                    Copy full account
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <FlashIcon color="action" />
                  <Typography variant="h6">Version</Typography>
                </Stack>
                <Typography variant="body1">
                  {nodeInfo?.version || 'Unknown'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {networkNode && (
            <>
              <Divider sx={{ my: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <PublicIcon color="action" />
                      <Typography variant="h6">Connected Peers</Typography>
                    </Stack>
                    <Typography variant="h4" color="primary">
                      {networkNode.connected || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <ApiIcon color="action" />
                      <Typography variant="h6">Discovered Peers</Typography>
                    </Stack>
                    <Typography variant="h4" color="primary">
                      {networkNode.discovered || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <StorageIcon color="action" />
                      <Typography variant="h6">Active Stakes</Typography>
                    </Stack>
                    <Typography variant="h4" color="primary">
                      {networkNode.stakes || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <FlashIcon color="success" />
                      <Typography variant="h6">Network Status</Typography>
                    </Stack>
                    <Chip label="Online" color="success" variant="outlined" />
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <SettingsIcon color="primary" />
            <Typography variant="h5" component="h2" fontWeight="bold">
              Application Settings
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  label="Theme"
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Box>
                <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                  Notifications
                </Typography>
                <Switch
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Box>
                <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                  Auto Refresh
                </Typography>
                <Switch
                  checked={settings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <FormControl fullWidth>
                <InputLabel>Refresh Interval</InputLabel>
                <Select
                  value={settings.refreshInterval}
                  label="Refresh Interval"
                  onChange={(e) => handleSettingChange('refreshInterval', e.target.value)}
                  disabled={!settings.autoRefresh}
                >
                  <MenuItem value={2000}>2 seconds</MenuItem>
                  <MenuItem value={5000}>5 seconds</MenuItem>
                  <MenuItem value={10000}>10 seconds</MenuItem>
                  <MenuItem value={30000}>30 seconds</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
            System Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Browser</Typography>
                <Typography variant="body2" color="text.secondary">
                  {navigator.userAgent.split(' ').pop()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Platform</Typography>
                <Typography variant="body2" color="text.secondary">
                  {navigator.platform}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Language</Typography>
                <Typography variant="body2" color="text.secondary">
                  {navigator.language}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Online</Typography>
                <Chip
                  label={navigator.onLine ? 'Yes' : 'No'}
                  color={navigator.onLine ? 'success' : 'error'}
                  variant="outlined"
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
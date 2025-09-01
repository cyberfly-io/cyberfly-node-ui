import React, { useState } from 'react'
import {
  Box, Container, TextField, Button, CircularProgress, Card, CardContent,
  Stack, Typography, Divider, Alert, InputAdornment, IconButton
} from '@mui/material'
import {
  Storage, Search, ReadMore, Code, Clear
} from '@mui/icons-material'
import ReactJson from 'react-json-view'
import { useDarkMode } from '../contexts/DarkModeContext'
import { getDBInfo, getReadDB } from '../services/node-services'

const Tools = () => {
  const { isDarkMode } = useDarkMode()
  const [loading, setLoading] = useState(false)
  const [dbinfo, setDbInfo] = useState(null)
  const [dbaddr, setDbaddr] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!dbaddr.trim()) {
      setError('Please provide a valid database address.')
      return
    }
    if (!dbaddr.startsWith('/orbitdb')) {
      setError('Database address should start with "/orbitdb"')
      return
    }

    setLoading(true)
    setError(null)
    setDbInfo(null)

    getDBInfo(dbaddr).then((data) => {
      setDbInfo(data)
      setLoading(false)
    }).catch((err) => {
      setError('Failed to fetch database info. Please check the address and try again.')
      setLoading(false)
    })
  }

  const readDb = () => {
    if (!dbaddr.trim()) {
      setError('Please enter a database address first.')
      return
    }

    setLoading(true)
    setError(null)
    setDbInfo(null)

    getReadDB(dbaddr).then((data) => {
      setDbInfo(data)
      setLoading(false)
    }).catch((err) => {
      setError('Failed to read database. Please check the address and try again.')
      setLoading(false)
    })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          background: isDarkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          color: 'white'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Storage />
          <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
              Database Tools
            </Typography>
            <Typography variant="body1">
              Query and analyze blockchain database information
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1000
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Loading database information...
            </Typography>
          </Box>
        )}

        <Stack spacing={3}>
          {/* Database Query Section */}
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Storage />
                <Typography variant="h6">Database Query</Typography>
              </Stack>

              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Database Address"
                  value={dbaddr}
                  onChange={(e) => {
                    setDbaddr(e.target.value)
                    setError(null)
                  }}
                  placeholder="/orbitdb/database-hash"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Storage />
                      </InputAdornment>
                    ),
                    endAdornment: dbaddr && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setDbaddr('')} size="small">
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  helperText="Enter the OrbitDB database address (starts with '/orbitdb')"
                  sx={{ mb: 3 }}
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Search />}
                    size="large"
                    disabled={loading}
                    sx={{ minWidth: 140 }}
                  >
                    Get DB Info
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={readDb}
                    startIcon={<ReadMore />}
                    size="large"
                    disabled={!dbaddr.trim() || loading}
                    sx={{ minWidth: 140 }}
                  >
                    Read Database
                  </Button>
                </Stack>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError(null)}
                  sx={{ mt: 2 }}
                >
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {dbinfo && (
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Code />
                  <Typography variant="h6">Query Results</Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Database address: <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>{dbaddr}</Typography>
                </Typography>

                <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <ReactJson
                    src={dbinfo}
                    theme={isDarkMode ? 'apathy' : 'apathy:inverted'}
                    collapsed={false}
                    collapseStringsAfterLength={100}
                    displayDataTypes={false}
                    displayObjectSize={true}
                    enableClipboard={true}
                    style={{ padding: 16 }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Help & Usage</Typography>

              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>How to use:</Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  <li>Enter a valid OrbitDB database address (starts with "/orbitdb")</li>
                  <li>Click "Get DB Info" to retrieve database metadata</li>
                  <li>Click "Read Database" to fetch the actual data</li>
                  <li>Results will be displayed in JSON format below</li>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Note:</strong> Database addresses are typically found in OrbitDB deployments
                  and can be used to query decentralized database state.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  )
}

export default Tools
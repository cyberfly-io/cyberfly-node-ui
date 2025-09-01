
import React, { useState, useEffect } from 'react'
import { Map, Marker, Overlay } from "pigeon-maps"
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Stack,
  Chip,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Public,
  LocationOn,
  Wifi,
  Hub
} from '@mui/icons-material'
import { getHost, getNodeInfo } from '../services/node-services'
import { useDarkMode } from '../contexts/DarkModeContext'
import GradientHeader from '../components/GradientHeader'

const NodeMap = () => {
    const [ipData, setIpData] = useState([])
    const [ipAddresses, setIpAddresses] = useState([])
    const [loadingMarkers, setLoadingMarkers] = useState([])
    const [visibleMarkers, setVisibleMarkers] = useState([])
    const [selectedNode, setSelectedNode] = useState(null)
    const [loading, setLoading] = useState(true)
    const { isDarkMode } = useDarkMode()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const isTablet = useMediaQuery(theme.breakpoints.down('md'))

    // Get node connections
    useEffect(() => {
        const getInfo = () => {
          getNodeInfo().then(data => {
            const peers = data.connections
            let iparray = []
            peers.forEach(element => {
                iparray.push(element.remoteAddr.split('/')[2])
            })
            setIpAddresses(iparray)
          })
        }
       getInfo()
    }, [])

    // Fetch IP location data one by one
    useEffect(() => {
        const fetchIpDataSequentially = async () => {
          const data = []
          setLoadingMarkers(new Array(ipAddresses.length).fill(true))

          for (let i = 0; i < ipAddresses.length; i++) {
            const ip = ipAddresses[i]
            try {
              console.log(`Fetching location for IP: ${ip} (${i + 1}/${ipAddresses.length})`)

              // Use GraphQL query template to get IP location
              const query = `query MyQuery {
                getIPLocation(ip: "${ip}") {
                  lat
                  lon
                  query
                  country
                  city
                }
              }`

              const response = await fetch('https://node.cyberfly.io/graphql', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  query: query,
                  operationName: "MyQuery"
                })
              })

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
              }

              const result = await response.json()

              if (result.errors) {
                console.error('GraphQL errors:', result.errors)
                throw new Error(result.errors[0].message)
              }

              const locationData = result.data.getIPLocation

              // Ensure we have valid coordinates
              const processedData = {
                ...locationData,
                lat: parseFloat(locationData.lat) || 0,
                lon: parseFloat(locationData.lon) || 0,
                ip: locationData.query || ip, // Use query field as IP, fallback to original IP
                city: locationData.city || 'Unknown',
                country: locationData.country || 'Unknown'
              }

              data.push(processedData)
              console.log(`Successfully loaded location for IP: ${ip}`, processedData)

              // Update loading state for this marker
              setLoadingMarkers(prev => {
                const newLoading = [...prev]
                newLoading[i] = false
                return newLoading
              })

              // Add to visible markers
              setVisibleMarkers(prev => [...prev, i])

            } catch (error) {
              console.error(`Failed to load location for IP: ${ip}`, error)

              // Add error marker
              data.push({
                ip: ip,
                lat: 0,
                lon: 0,
                city: 'Error',
                country: 'Error',
                error: true
              })

              // Update loading state for this marker
              setLoadingMarkers(prev => {
                const newLoading = [...prev]
                newLoading[i] = false
                return newLoading
              })

              // Add to visible markers even with error
              setVisibleMarkers(prev => [...prev, i])
            }
          }

          setIpData(data)
          setLoading(false)
        }

        if (ipAddresses.length > 0) {
          fetchIpDataSequentially()
        } else {
          setLoading(false)
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [ipAddresses])

    // Custom marker component
    const CustomMarker = ({ data, index, isVisible }) => {
      if (!isVisible) return null

      const isError = data.error || (!data.lat && !data.lon)
      const borderColor = isError ? '#ff4d4f' : (isDarkMode ? '#1890ff' : '#1890ff')
      const backgroundColor = isError ? '#fff2f0' : (isDarkMode ? '#1a1a1a' : '#ffffff')

      return (
        <Marker
          key={index}
          anchor={[data.lat || 0, data.lon || 0]}
          onClick={() => setSelectedNode(data)}
        >
          <div style={{
            background: backgroundColor,
            border: `2px solid ${borderColor}`,
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transform: 'translate(-50%, -50%)',
            animation: 'bounceIn 0.5s ease-out'
          }}>
            <Hub
              style={{
                color: borderColor,
                fontSize: '20px'
              }}
            />
          </div>
        </Marker>
      )
    }

    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <GradientHeader
          icon={<Public sx={{ fontSize: 28 }} />}
          title="Node Explorer"
          subtitle="Interactive world map of CyberFly network nodes"
        />

        <Stack spacing={3}>
          {/* Statistics Dashboard */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[1] }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Hub color="primary" />
                    <Typography variant="h6" component="div">
                      Total Nodes
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    {ipData.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[1] }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <LocationOn color="success" />
                    <Typography variant="h6" component="div">
                      Active Markers
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    {visibleMarkers.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[1] }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Wifi color="warning" />
                    <Typography variant="h6" component="div">
                      Loading Progress
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                    {Math.round(((ipAddresses.length - loadingMarkers.filter(Boolean).length) / Math.max(ipAddresses.length, 1)) * 100)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[1] }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Wifi color={loading ? 'warning' : 'success'} />
                    <Typography variant="h6" component="div">
                      Current Status
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ color: loading ? 'warning.main' : 'success.main', fontWeight: 'bold' }}>
                    {loading ? `Loading ${visibleMarkers.length + 1}/${ipAddresses.length}` : 'Complete'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Map Container */}
          <Card sx={{ boxShadow: (theme) => theme.shadows[1] }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{
                position: 'relative',
                height: isMobile ? '400px' : isTablet ? '500px' : '600px',
                overflow: 'hidden',
                borderRadius: 1
              }}>
                {loading && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000
                  }}>
                    <CircularProgress size={60} />
                  </Box>
                )}

                <Map
                  center={[20, 0]}
                  zoom={2}
                  style={{ width: '100%', height: '100%' }}
                >
                  {ipData.map((data, index) => (
                    <CustomMarker
                      key={index}
                      data={data}
                      index={index}
                      isVisible={visibleMarkers.includes(index)}
                    />
                  ))}

                  {selectedNode && (
                    <Overlay
                      anchor={[selectedNode.lat || 0, selectedNode.lon || 0]}
                      offset={[0, -40]}
                    >
                      <Card sx={{
                        minWidth: 250,
                        boxShadow: (theme) => theme.shadows[4],
                        borderRadius: 2
                      }}>
                        <CardContent>
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Hub />
                              Node Information
                            </Typography>

                            <Box>
                              <Typography variant="body2" color="text.secondary">IP Address:</Typography>
                              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                {selectedNode.query || selectedNode.ip}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="body2" color="text.secondary">Location:</Typography>
                              <Typography variant="body1">
                                {selectedNode.city && selectedNode.country ? `${selectedNode.city}, ${selectedNode.country}` : 'Location unavailable'}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="body2" color="text.secondary">Coordinates:</Typography>
                              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                {selectedNode.lat?.toFixed(4)}, {selectedNode.lon?.toFixed(4)}
                              </Typography>
                            </Box>

                            <Button
                              size="small"
                              onClick={() => setSelectedNode(null)}
                              sx={{ alignSelf: 'flex-end' }}
                            >
                              Close
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Overlay>
                  )}
                </Map>
              </Box>
            </CardContent>
          </Card>

          {/* Node List */}
          {ipData.length > 0 && (
            <Card sx={{ boxShadow: (theme) => theme.shadows[1] }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <Hub color="primary" />
                  <Typography variant="h6" component="div">
                    Connected Nodes ({ipData.length})
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  {ipData.map((node, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          backgroundColor: visibleMarkers.includes(index)
                            ? (theme) => theme.palette.background.paper
                            : (theme) => theme.palette.action.hover,
                          border: visibleMarkers.includes(index)
                            ? node.error ? '1px solid #ff4d4f' : '1px solid #1890ff'
                            : '1px solid #d9d9d9',
                          '&:hover': {
                            boxShadow: (theme) => theme.shadows[4],
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => setSelectedNode(node)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                Node {index + 1}
                              </Typography>
                              {node.error ? (
                                <Chip label="Error" color="error" size="small" />
                              ) : visibleMarkers.includes(index) ? (
                                <Chip label="Active" color="success" size="small" />
                              ) : (
                                <Chip label="Loading" color="warning" size="small" />
                              )}
                            </Box>

                            <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {node.query || node.ip}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              {node.city && node.country ? `${node.city}, ${node.country}` : 'Location unavailable'}
                            </Typography>

                            {node.error && (
                              <Typography variant="caption" color="error">
                                Failed to load location
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Stack>

        <style jsx>{`
          @keyframes bounceIn {
            0% {
              transform: translate(-50%, -50%) scale(0.3);
              opacity: 0;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.05);
            }
            70% {
              transform: translate(-50%, -50%) scale(0.9);
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </Container>
    )
}

export default NodeMap
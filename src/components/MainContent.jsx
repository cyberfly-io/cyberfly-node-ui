import React, { useEffect, useState } from 'react';
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
  Button,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Avatar,
 
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Apartment as ApartmentIcon,
  Info as InfoIcon,
  Dns as DeploymentUnitIcon,
  ShowChart as RadarChartIcon,
  AttachMoney as DollarIcon,
  Api as ApiIcon,
  Visibility as VisibilityIcon,
  Percent as PercentIcon,
  Wifi as WifiIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  AccountTree as NodeIndexIcon,
  Bolt as ThunderboltIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { getNodeInfo } from '../services/node-services';
import { getActiveNodes, getAPY, getStakeStats } from '../services/pact-services';
import { getIPFromMultiAddr } from '../utils/utils';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const MainContent = () => {
  const [peers, setPeers] = useState([]);
  const [peerItems, setPeerItems] = useState([]);
  const [cCount, setCCount] = useState(0);
  const [dCount, setDCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState();
  const [nodeInfo, setNodeInfo] = useState(null);
  const [activeNodes, setActiveNodes] = useState(0);
  const [locked, setLocked] = useState(0);
  const [stakesCount, setStakesCount] = useState(0);
  const navigate = useNavigate();
  const [apy, setApy] = useState(0);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    function getInfo() {
      getNodeInfo().then((data) => {
        setNodeInfo(data);
        setCCount(data.connected);
        setDCount(data.discovered);
        setVersion(data.version);
        setPeers(data.connections);
        setLoading(false);
      });
      getActiveNodes().then((data) => {
        setActiveNodes(data.length);
      });
      getStakeStats().then((data) => {
        setStakesCount(data['total-stakes']['int']);
        setLocked(data['total-staked-amount']);
      });
      getAPY().then((data) => {
        setApy(data);
      });
    }
    getInfo();
    const intervalId = setInterval(getInfo, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (peers) {
      const items = peers.map((item, index) => ({
        key: item.remotePeer,
        peerId: item.remotePeer,
        address: item.remoteAddr,
        label: (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
              <NodeIndexIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" fontWeight="bold">
              {item.remotePeer.substring(0, 12)}...
            </Typography>
            <Badge color="success" variant="dot" />
            <Typography variant="caption" color="success.main">Connected</Typography>
          </Stack>
        )
      }));
      setPeerItems(items);
    }
  }, [peers]);

  // Calculate network health percentage
  const networkHealth = Math.min(100, (cCount / Math.max(activeNodes, 1)) * 100);

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Header Section */}
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
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 1, sm: 2 }}
            sx={{ mb: { xs: 1, sm: 2 } }}
          >
            <PublicIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2.125rem' },
                  fontWeight: 700,
                  mb: 0.5
                }}
              >
                Network Dashboard
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  opacity: 0.9
                }}
              >
                Real-time node and network statistics
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              mt: 2,
              flexWrap: 'wrap',
              '& > *': { mb: 0.5 }
            }}
          >
            {version && (
              <Chip
                icon={<InfoIcon />}
                label={`v${version}`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            )}
          </Stack>
        </Box>
      </Paper>

      <Stack spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%' }}>
        {/* Node Information Card */}
        {nodeInfo && (
          <Card
            elevation={2}
            sx={{
              borderRadius: 3,
              background: isDarkMode
                ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 1, sm: 2 }}
                sx={{ mb: { xs: 2, sm: 3 } }}
              >
                <DeploymentUnitIcon color="primary" sx={{ fontSize: { xs: 28, sm: 32 } }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    fontWeight: 600
                  }}
                >
                  Node Information
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1, sm: 1 }}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  <Chip
                    label={nodeInfo?.health === 'ok' ? 'Active' : 'Inactive'}
                    color={nodeInfo?.health === 'ok' ? 'success' : 'error'}
                    size="small"
                    sx={{ minWidth: 70 }}
                  />
                  <Button
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/node/${nodeInfo?.peerId}`)}
                    size="small"
                    variant="outlined"
                    fullWidth={{ xs: true, sm: false }}
                    sx={{ minWidth: { xs: 'auto', sm: 120 } }}
                  >
                    View Details
                  </Button>
                </Stack>
              </Stack>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} sm={6} lg={4}>
                  <Box sx={{ mb: { xs: 1, sm: 0 } }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      Peer ID
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          flexGrow: 1,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          border: `1px solid ${isDarkMode ? 'grey.700' : 'grey.300'}`
                        }}
                      >
                        {nodeInfo?.peerId}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => navigator.clipboard.writeText(nodeInfo?.peerId)}
                        sx={{
                          bgcolor: isDarkMode ? 'grey.700' : 'grey.200',
                          '&:hover': {
                            bgcolor: isDarkMode ? 'grey.600' : 'grey.300'
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Box sx={{ mb: { xs: 1, sm: 0 } }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      Account
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          flexGrow: 1,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          border: `1px solid ${isDarkMode ? 'grey.700' : 'grey.300'}`
                        }}
                      >
                        {nodeInfo?.account}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => navigator.clipboard.writeText(nodeInfo?.account)}
                        sx={{
                          bgcolor: isDarkMode ? 'grey.700' : 'grey.200',
                          '&:hover': {
                            bgcolor: isDarkMode ? 'grey.600' : 'grey.300'
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      Version
                    </Typography>
                    <Chip
                      label={`v${version}`}
                      color="primary"
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Network Statistics Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
            background: isDarkMode
              ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: { xs: 2, sm: 3 } }}
            >
              <RadarChartIcon color="primary" sx={{ fontSize: { xs: 28, sm: 32 } }} />
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 600
                }}
              >
                Network Statistics
              </Typography>
            </Stack>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6} lg={4}>
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    bgcolor: isDarkMode ? 'grey.800' : 'grey.50',
                    border: `1px solid ${isDarkMode ? 'grey.700' : 'grey.200'}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Connected Peers
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ApartmentIcon color="primary" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                      <Typography
                        variant="h4"
                        color="primary.main"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2.125rem' },
                          fontWeight: 700
                        }}
                      >
                        {cCount}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    bgcolor: isDarkMode ? 'grey.800' : 'grey.50',
                    border: `1px solid ${isDarkMode ? 'grey.700' : 'grey.200'}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Discovered Peers
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <WifiIcon color="success" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                      <Typography
                        variant="h4"
                        color="success.main"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2.125rem' },
                          fontWeight: 700
                        }}
                      >
                        {dCount}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    bgcolor: isDarkMode ? 'grey.800' : 'grey.50',
                    border: `1px solid ${isDarkMode ? 'grey.700' : 'grey.200'}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Active Nodes
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PublicIcon color="warning" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                      <Typography
                        variant="h4"
                        color="warning.main"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2.125rem' },
                          fontWeight: 700
                        }}
                      >
                        {activeNodes}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Staking Information Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
            background: isDarkMode
              ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: { xs: 2, sm: 3 } }}
            >
              <LockIcon color="primary" sx={{ fontSize: { xs: 28, sm: 32 } }} />
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 600
                }}
              >
                Staking Overview
              </Typography>
            </Stack>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6} lg={4}>
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    bgcolor: isDarkMode ? 'grey.800' : 'grey.50',
                    border: `1px solid ${isDarkMode ? 'grey.700' : 'grey.200'}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Total Stakes
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ApiIcon color="success" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                      <Typography
                        variant="h4"
                        color="success.main"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2.125rem' },
                          fontWeight: 700
                        }}
                      >
                        {stakesCount}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    bgcolor: isDarkMode ? 'grey.800' : 'grey.50',
                    border: `1px solid ${isDarkMode ? 'grey.700' : 'grey.200'}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Locked Supply
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DollarIcon color="warning" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                      <Typography
                        variant="h4"
                        color="warning.main"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2.125rem' },
                          fontWeight: 700
                        }}
                      >
                        {locked}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        CFLY
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    bgcolor: isDarkMode ? 'grey.800' : 'grey.50',
                    border: `1px solid ${isDarkMode ? 'grey.700' : 'grey.200'}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Reward Rate
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PercentIcon color="secondary" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                      <Typography
                        variant="h4"
                        color="secondary.main"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2.125rem' },
                          fontWeight: 700
                        }}
                      >
                        {apy}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        % APY
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Connected Peers Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
            background: isDarkMode
              ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={{ xs: 1, sm: 2 }}
              sx={{ mb: { xs: 2, sm: 3 } }}
            >
              <WifiIcon color="primary" sx={{ fontSize: { xs: 28, sm: 32 } }} />
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 600
                }}
              >
                Connected Peers
              </Typography>
              <Badge
                badgeContent={cCount}
                color="success"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    minWidth: { xs: 16, sm: 20 },
                    height: { xs: 16, sm: 20 }
                  }
                }}
              />
              <Box sx={{ flexGrow: 1 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  textAlign: { xs: 'left', sm: 'right' }
                }}
              >
                {dCount} discovered • {cCount} connected
              </Typography>
            </Stack>

            {peerItems.length > 0 ? (
              <Stack spacing={1}>
                {peerItems.map((item, index) => (
                  <Accordion
                    key={item.key}
                    elevation={1}
                    sx={{
                      borderRadius: 2,
                      bgcolor: isDarkMode ? 'grey.800' : 'grey.50',
                      border: `1px solid ${isDarkMode ? 'grey.700' : 'grey.200'}`,
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': {
                        bgcolor: isDarkMode ? 'grey.700' : 'grey.100'
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
                      aria-controls={`peer-${index}-content`}
                      id={`peer-${index}-header`}
                      sx={{
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1.5, sm: 2 },
                        minHeight: { xs: 48, sm: 56 }
                      }}
                    >
                      {item.label}
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                      <Card
                        size="small"
                        sx={{
                          bgcolor: isDarkMode ? 'grey.900' : 'grey.50',
                          border: `1px solid ${isDarkMode ? 'grey.600' : 'grey.300'}`,
                          borderRadius: 2
                        }}
                      >
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          <Stack spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%' }}>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                                sx={{ fontWeight: 500 }}
                              >
                                Peer ID:{' '}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: 'inline',
                                  wordBreak: 'break-all',
                                  fontFamily: 'monospace',
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                                  p: 1,
                                  borderRadius: 1,
                                  border: `1px solid ${isDarkMode ? 'grey.700' : 'grey.300'}`
                                }}
                              >
                                {item.peerId}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => navigator.clipboard.writeText(item.peerId)}
                                sx={{
                                  ml: 1,
                                  bgcolor: isDarkMode ? 'grey.700' : 'grey.200',
                                  '&:hover': {
                                    bgcolor: isDarkMode ? 'grey.600' : 'grey.300'
                                  }
                                }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                                sx={{ fontWeight: 500 }}
                              >
                                Address:{' '}
                              </Typography>
                              <Typography
                                variant="body2"
                                component="a"
                                href={getIPFromMultiAddr(item.address)}
                                target="_blank"
                                rel="noreferrer"
                                sx={{
                                  color: 'primary.main',
                                  textDecoration: 'none',
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  wordBreak: 'break-all',
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                              >
                                {item.address}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => navigator.clipboard.writeText(item.address)}
                                sx={{
                                  ml: 1,
                                  bgcolor: isDarkMode ? 'grey.700' : 'grey.200',
                                  '&:hover': {
                                    bgcolor: isDarkMode ? 'grey.600' : 'grey.300'
                                  }
                                }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                                sx={{ fontWeight: 500 }}
                              >
                                Status:{' '}
                              </Typography>
                              <Chip
                                icon={<ThunderboltIcon />}
                                label="Active"
                                color="success"
                                size="small"
                                variant="outlined"
                                sx={{
                                  ml: 1,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                              />
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            ) : (
              <Stack
                alignItems="center"
                spacing={2}
                sx={{
                  py: { xs: 4, sm: 6 },
                  px: { xs: 2, sm: 3 }
                }}
              >
                <WifiIcon
                  sx={{
                    fontSize: { xs: 40, sm: 48 },
                    color: 'grey.400'
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textAlign: 'center',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  No peers connected
                </Typography>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Network Status Footer */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            background: isDarkMode
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isDarkMode
                ? 'rgba(255, 255, 255, 0.02)'
                : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 3,
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              spacing={{ xs: 2, sm: 3 }}
            >
              <Grid item xs={12} sm={8}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={{ xs: 1, sm: 2 }}
                  flexWrap="wrap"
                >
                  <PublicIcon
                    color="primary"
                    sx={{ fontSize: { xs: 24, sm: 28 } }}
                  />
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      color: isDarkMode ? 'white' : 'inherit'
                    }}
                  >
                    Network Status
                  </Typography>
                  <Badge
                    color="success"
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        width: { xs: 8, sm: 10 },
                        height: { xs: 8, sm: 10 }
                      }
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      fontWeight: 500
                    }}
                  >
                    Operational
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    textAlign: { xs: 'left', sm: 'right' },
                    color: isDarkMode ? 'grey.300' : 'inherit'
                  }}
                >
                  Last updated: {new Date().toLocaleTimeString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default MainContent;

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

  return (
    <Container maxWidth="lg" sx={{ 
      px: { xs: 1, sm: 1.5 }, 
      py: { xs: 1, sm: 1.5 },
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Hero Section */}
      <Box
        sx={{
          mb: { xs: 1, sm: 1.5 },
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(66, 133, 244, 0.15) 0%, rgba(156, 39, 176, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
          backdropFilter: 'blur(30px)',
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: isDarkMode
            ? '0 12px 48px rgba(0, 0, 0, 0.4)'
            : '0 12px 48px rgba(0, 0, 0, 0.15)',
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
              ? 'radial-gradient(circle at 30% 50%, rgba(66, 133, 244, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 30% 50%, rgba(66, 133, 244, 0.05) 0%, transparent 50%)',
            borderRadius: 4,
            pointerEvents: 'none'
          }
        }}
      >
        <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                width: { xs: 44, sm: 52 },
                height: { xs: 44, sm: 52 },
                background: 'linear-gradient(135deg, #4285f4 0%, #9c27b0 100%)',
                boxShadow: '0 8px 24px rgba(66, 133, 244, 0.4)'
              }}
            >
              <PublicIcon sx={{ fontSize: { xs: 26, sm: 32 }, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 800,
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)'
                    : 'linear-gradient(135deg, #1a1a1a 0%, #424242 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                Cyberfly Network
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'text.secondary',
                  fontWeight: 500
                }}
              >
                Decentralized P2P Network Dashboard
              </Typography>
            </Box>
          </Stack>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ mt: 1.5 }}
          >
            <Chip
              icon={<WifiIcon />}
              label={`${cCount} Connected`}
              color="success"
              sx={{
                px: 1,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            />
            <Chip
              icon={<PublicIcon />}
              label={`${dCount} Discovered`}
              color="primary"
              sx={{
                px: 1,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            />
            {activeNodes && (
              <Chip
                icon={<ApartmentIcon />}
                label={`${activeNodes} Active Nodes`}
                color="info"
                sx={{
                  px: 1,
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              />
            )}
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%' }}>
        {/* Network Statistics Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            background: isDarkMode
              ? 'rgba(42, 42, 42, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ mb: { xs: 1.5, sm: 2 } }}
            >
              <RadarChartIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
                  fontWeight: 600
                }}
              >
                Network Statistics
              </Typography>
            </Stack>

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={12} sm={6} lg={4}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isDarkMode
                      ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                      : '0 4px 16px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: isDarkMode
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)'
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
                      <ApartmentIcon color="primary" sx={{ fontSize: { xs: 18, sm: 22 } }} />
                      <Typography
                        variant="h4"
                        color="primary.main"
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.75rem' },
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
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isDarkMode
                      ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                      : '0 4px 16px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: isDarkMode
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)'
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
                      <WifiIcon color="success" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Typography
                        variant="h4"
                        color="success.main"
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.75rem' },
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
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isDarkMode
                      ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                      : '0 4px 16px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: isDarkMode
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)'
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
                      <PublicIcon color="warning" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Typography
                        variant="h4"
                        color="warning.main"
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.75rem' },
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
          elevation={0}
          sx={{
            borderRadius: 2,
            background: isDarkMode
              ? 'rgba(42, 42, 42, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ mb: { xs: 1.5, sm: 2 } }}
            >
              <LockIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
                  fontWeight: 600
                }}
              >
                Staking Overview
              </Typography>
            </Stack>

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={12} sm={6} lg={4}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isDarkMode
                      ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                      : '0 4px 16px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: isDarkMode
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)'
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
                      <ApiIcon color="success" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Typography
                        variant="h4"
                        color="success.main"
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.75rem' },
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
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isDarkMode
                      ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                      : '0 4px 16px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: isDarkMode
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)'
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
                      <DollarIcon color="warning" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Typography
                        variant="h4"
                        color="warning.main"
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.75rem' },
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
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isDarkMode
                      ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                      : '0 4px 16px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: isDarkMode
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)'
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
                      <PercentIcon color="secondary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Typography
                        variant="h4"
                        color="secondary.main"
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.75rem' },
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
  {nodeInfo && (
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              background: isDarkMode
                ? 'rgba(42, 42, 42, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 1, sm: 1.5 }}
                sx={{ mb: { xs: 1.5, sm: 2 } }}
              >
                <DeploymentUnitIcon color="primary" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
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
        {/* Connected Peers Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            background: isDarkMode
              ? 'rgba(42, 42, 42, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
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
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      background: isDarkMode
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: isDarkMode
                        ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                        : '0 4px 16px rgba(0, 0, 0, 0.05)',
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': {
                        background: isDarkMode
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(255, 255, 255, 0.15)',
                        boxShadow: isDarkMode
                          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                          : '0 8px 32px rgba(0, 0, 0, 0.1)'
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
                          background: isDarkMode
                            ? 'rgba(255, 255, 255, 0.03)'
                            : 'rgba(255, 255, 255, 0.08)',
                          backdropFilter: 'blur(8px)',
                          border: isDarkMode
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: 2,
                          boxShadow: isDarkMode
                            ? '0 2px 8px rgba(0, 0, 0, 0.15)'
                            : '0 2px 8px rgba(0, 0, 0, 0.05)'
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
          elevation={0}
          sx={{
            borderRadius: 3,
            background: isDarkMode
              ? 'rgba(26, 26, 26, 0.9)'
              : 'rgba(248, 249, 250, 0.9)',
            backdropFilter: 'blur(25px)',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isDarkMode
              ? '0 12px 40px rgba(0, 0, 0, 0.4)'
              : '0 12px 40px rgba(0, 0, 0, 0.15)',
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

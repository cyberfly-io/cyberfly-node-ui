import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Box,
  Chip,
  CircularProgress,
  Backdrop,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Router as RouterIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Cable as CableIcon,
} from '@mui/icons-material';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getBridgeMetrics, getBridgeHealth } from '../services/node-services';

const BridgeMonitor = () => {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useDarkMode();

  const fetchData = async () => {
    try {
      setError(null);
      const [metricsData, healthData] = await Promise.all([
        getBridgeMetrics(),
        getBridgeHealth(),
      ]);

      setMetrics(metricsData);
      setHealth(healthData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon />;
      case 'degraded':
        return <WarningIcon />;
      case 'unhealthy':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  const getCircuitBreakerColor = (state) => {
    switch (state) {
      case 'closed':
        return 'success';
      case 'open':
        return 'error';
      case 'half-open':
        return 'warning';
      default:
        return 'default';
    }
  };

  const StatBox = ({ title, value, subtitle, icon, color = 'primary' }) => (
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
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon}
          <Typography
            variant="h4"
            color={`${color}.main`}
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.75rem' },
              fontWeight: 700,
            }}
          >
            {value}
          </Typography>
        </Stack>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Box>
  );

  if (loading) {
    return (
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        px: { xs: 1, sm: 1.5 },
        py: { xs: 1, sm: 1.5 },
        background: isDarkMode
          ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
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
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <CableIcon sx={{ fontSize: { xs: 26, sm: 32 }, color: 'primary.main' }} />
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  fontWeight: 800,
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)'
                    : 'linear-gradient(135deg, #1a1a1a 0%, #424242 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Bridge Monitor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                libp2p ↔ MQTT Bridge Health & Metrics
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {health && (
              <Chip
                icon={getStatusIcon(health.status)}
                label={health.status.toUpperCase()}
                color={getStatusColor(health.status)}
                sx={{ fontWeight: 600 }}
              />
            )}
            <IconButton onClick={fetchData} color="primary" size="small">
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={{ xs: 1.5, sm: 2 }}>
        {/* System Overview */}
        {metrics && (
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              background: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <TimelineIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9375rem', sm: '1.0625rem' }, fontWeight: 600 }}>
                  System Overview
                </Typography>
              </Stack>

              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatBox
                    title="Uptime"
                    value={metrics.uptime.formatted}
                    icon={<SpeedIcon color="primary" sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatBox
                    title="Loops Prevented"
                    value={metrics.loopsPrevented}
                    icon={<RouterIcon color="success" sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatBox
                    title="MQTT Messages"
                    value={metrics.mqtt.messagesReceived}
                    subtitle={`${metrics.mqtt.messagesFailed} failed`}
                    icon={<MemoryIcon color="warning" sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                    color="warning"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatBox
                    title="libp2p Messages"
                    value={metrics.libp2p.messagesReceived}
                    subtitle={`${metrics.libp2p.messagesFailed} failed`}
                    icon={<TrendingUpIcon color="secondary" sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                    color="secondary"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Component Health */}
        {health && (
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              background: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <CheckCircleIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9375rem', sm: '1.0625rem' }, fontWeight: 600 }}>
                  Component Health
                </Typography>
              </Stack>

              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {/* MQTT Health */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                      border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight={600}>
                          MQTT
                        </Typography>
                        <Chip
                          size="small"
                          label={health.components.mqtt.status}
                          color={getStatusColor(health.components.mqtt.status)}
                        />
                      </Stack>
                      <Divider />
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Connected
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {health.components.mqtt.connected ? 'Yes' : 'No'}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Circuit Breaker
                          </Typography>
                          <Chip
                            size="small"
                            label={health.components.mqtt.circuitBreaker}
                            color={getCircuitBreakerColor(health.components.mqtt.circuitBreaker)}
                          />
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>

                {/* libp2p Health */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                      border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight={600}>
                          libp2p
                        </Typography>
                        <Chip
                          size="small"
                          label={health.components.libp2p.status}
                          color={getStatusColor(health.components.libp2p.status)}
                        />
                      </Stack>
                      <Divider />
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Peer Count
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {health.components.libp2p.peerCount}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Circuit Breaker
                          </Typography>
                          <Chip
                            size="small"
                            label={health.components.libp2p.circuitBreaker}
                            color={getCircuitBreakerColor(health.components.libp2p.circuitBreaker)}
                          />
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>

                {/* Socket Health */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                      border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight={600}>
                          Socket
                        </Typography>
                        <Chip
                          size="small"
                          label={health.components.socket.status}
                          color={getStatusColor(health.components.socket.status)}
                        />
                      </Stack>
                      <Divider />
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {health.components.socket.lastError ? 'Last error occurred' : 'No errors'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Detailed Metrics */}
        {metrics && (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {/* MQTT Metrics */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  background: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isDarkMode
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <MemoryIcon color="warning" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.9375rem', sm: '1.0625rem' }, fontWeight: 600 }}>
                      MQTT Metrics
                    </Typography>
                  </Stack>

                  <Stack spacing={1.5}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Messages Received
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.mqtt.messagesReceived}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Messages Published
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.mqtt.messagesPublished}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Messages Failed
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">
                          {metrics.mqtt.messagesFailed}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Duplicates Dropped
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.mqtt.duplicatesDropped}
                        </Typography>
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Rates
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Publish Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.rates.mqtt.publishRate} msg/s
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Receive Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.rates.mqtt.receiveRate} msg/s
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Error Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">
                          {metrics.rates.mqtt.errorRate}
                        </Typography>
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Circuit Breaker
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          State
                        </Typography>
                        <Chip
                          size="small"
                          label={metrics.circuitBreakers.mqtt.state}
                          color={getCircuitBreakerColor(metrics.circuitBreakers.mqtt.state)}
                        />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Failures
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.circuitBreakers.mqtt.failures}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* libp2p Metrics */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  background: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isDarkMode
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <TrendingUpIcon color="secondary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.9375rem', sm: '1.0625rem' }, fontWeight: 600 }}>
                      libp2p Metrics
                    </Typography>
                  </Stack>

                  <Stack spacing={1.5}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Messages Received
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.libp2p.messagesReceived}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Messages Published
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.libp2p.messagesPublished}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Messages Failed
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">
                          {metrics.libp2p.messagesFailed}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Duplicates Dropped
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.libp2p.duplicatesDropped}
                        </Typography>
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Rates
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Publish Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.rates.libp2p.publishRate} msg/s
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Receive Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.rates.libp2p.receiveRate} msg/s
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Error Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">
                          {metrics.rates.libp2p.errorRate}
                        </Typography>
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Circuit Breaker
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          State
                        </Typography>
                        <Chip
                          size="small"
                          label={metrics.circuitBreakers.libp2p.state}
                          color={getCircuitBreakerColor(metrics.circuitBreakers.libp2p.state)}
                        />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Failures
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {metrics.circuitBreakers.libp2p.failures}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Socket Metrics */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  background: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isDarkMode
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <RouterIcon color="info" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.9375rem', sm: '1.0625rem' }, fontWeight: 600 }}>
                      Socket Metrics
                    </Typography>
                  </Stack>

                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <StatBox
                        title="Messages Received"
                        value={metrics.socket.messagesReceived}
                        icon={<TrendingUpIcon color="info" sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                        color="info"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <StatBox
                        title="Messages Broadcast"
                        value={metrics.socket.messagesBroadcast}
                        icon={<RouterIcon color="success" sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                        color="success"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <StatBox
                        title="Messages Failed"
                        value={metrics.socket.messagesFailed}
                        icon={<ErrorIcon color="error" sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                        color="error"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Configuration */}
        {metrics && metrics.config && (
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              background: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <SettingsIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9375rem', sm: '1.0625rem' }, fontWeight: 600 }}>
                  Configuration
                </Typography>
              </Stack>

              <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                {Object.entries(metrics.config).map(([key, value]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {key}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          maxWidth: '60%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {typeof value === 'boolean' ? (value ? 'true' : 'false') : Array.isArray(value) ? `[${value.length}]` : value.toString()}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
};

export default BridgeMonitor;

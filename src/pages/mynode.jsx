import React, { useEffect, useState } from 'react';
import { getMyNodes, getNodeStake } from '../services/pact-services';
import {
  Card, CardContent, CardActions, Button, Tooltip, Grid, Typography,
  Box, Chip, Avatar, CircularProgress, Divider, Stack, useTheme, useMediaQuery, Container
} from '@mui/material';
import {
  Visibility as EyeOutlined,
  AccountTree as NodeIndexOutlined,
  EmojiEvents as CrownOutlined,
  Schedule as ClockCircleOutlined,
  Public as GlobalOutlined,
  ElectricBolt as ThunderboltOutlined,
  Storage as DatabaseOutlined,
  AccountBalanceWallet as WalletOutlined
} from '@mui/icons-material';
import { useKadenaWalletContext } from '../contexts/kadenaWalletContext';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const MyNode = () => {
  const [mynodes, setMyNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nodeStakes, setNodeStakes] = useState({});
  const { initializeKadenaWallet, account } = useKadenaWalletContext();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkMode } = useDarkMode();

  const fetchNodeStakes = async (nodes) => {
    const stakes = {};
    await Promise.all(
      nodes.map(async (node) => {
        try {
          const stakeData = await getNodeStake(node.peer_id);
          stakes[node.peer_id] = stakeData;
        } catch (error) {
          console.error(`Error fetching stake for node ${node.peer_id}:`, error);
          stakes[node.peer_id] = { active: false };
        }
      })
    );
    setNodeStakes(stakes);
  };

  useEffect(() => {
    if (account) {
      setLoading(true);
      getMyNodes(account).then((data) => {
        setMyNodes(data);
        fetchNodeStakes(data).finally(() => {
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }
  }, [account]);

  // Calculate statistics
  const totalNodes = mynodes.length;
  const activeNodes = mynodes.filter(node => node.status === 'active').length;
  const inactiveNodes = totalNodes - activeNodes;
  const stakedNodes = Object.values(nodeStakes).filter(stake => stake?.active).length;

  const renderNodeCard = (node) => {
    const stakeInfo = nodeStakes[node.peer_id];
    const isActive = node.status === 'active';
    const isStaked = stakeInfo?.active;

    return (
      <Grid item xs={12} sm={6} lg={4} xl={3} key={node.peer_id}>
        <Card
          sx={{
            height: '100%',
            borderRadius: 4,
            border: 'none',
            background: isDarkMode
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease-in-out',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: isDarkMode
                ? '0 16px 48px rgba(0, 0, 0, 0.4)'
                : '0 16px 48px rgba(0, 0, 0, 0.15)'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: isActive
                ? 'linear-gradient(90deg, #4caf50, #43e97b)'
                : isStaked
                ? 'linear-gradient(90deg, #ff9800, #fa709a)'
                : 'linear-gradient(90deg, #9e9e9e, #bdbdbd)',
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Node Header */}
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    color: isDarkMode ? '#ffffff' : '#2c3e50'
                  }}
                >
                  Node {node.peer_id.slice(0, 8)}...
                </Typography>
                <Chip
                  label={isActive ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    backgroundColor: isActive ? '#4caf50' : '#f44336',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode ? '#b0b0b0' : '#7f8c8d',
                  fontSize: '0.875rem',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => navigator.clipboard.writeText(node.peer_id)}
              >
                {isMobile ? node.peer_id.slice(0, 15) + '...' : node.peer_id.slice(0, 20) + '...'}
              </Typography>
            </Box>

            {/* Node Stats */}
            <Box sx={{ flexGrow: 1, mb: 2 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode ? '#b0b0b0' : '#7f8c8d',
                      fontSize: '0.875rem'
                    }}
                  >
                    Status
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isActive ? '#4caf50' : '#f44336'
                    }}
                  >
                    {isActive ? 'Online' : 'Offline'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode ? '#b0b0b0' : '#7f8c8d',
                      fontSize: '0.875rem'
                    }}
                  >
                    Staking
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isStaked ? '#ff9800' : '#9e9e9e'
                    }}
                  >
                    {isStaked ? 'Staked' : 'Unstaked'}
                  </Typography>
                </Box>

                {node.uptime && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDarkMode ? '#b0b0b0' : '#7f8c8d',
                        fontSize: '0.875rem'
                      }}
                    >
                      Uptime
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: isDarkMode ? '#ffffff' : '#2c3e50'
                      }}
                    >
                      {node.uptime}%
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Staking Info */}
            {stakeInfo && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ color: isDarkMode ? '#b0b0b0' : 'inherit', fontSize: '12px' }}>
                  Staked Amount
                </Typography>
                <Typography variant="body2" sx={{
                  fontWeight: 'bold',
                  color: isStaked ? '#52c41a' : '#ff4d4f',
                  fontSize: '14px'
                }}>
                  {stakeInfo.amount || 0} CFLY
                </Typography>
              </Box>
            )}

            {/* Node Actions */}
            <Box sx={{ mt: 'auto' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<EyeOutlined />}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                      : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                    '&:hover': {
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                        : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                    }
                  }}
                  onClick={() => navigate(`/node/${node.peer_id}`)}
                >
                  View Details
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

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
                <DatabaseOutlined sx={{ fontSize: { xs: 24, sm: 28 } }} />
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
                  My Nodes
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    opacity: 0.9,
                    fontWeight: 400
                  }}
                >
                  Manage and monitor your CyberFly network nodes
                </Typography>
              </Box>
            </Stack>

            {account && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <WalletOutlined sx={{ fontSize: 20, opacity: 0.8 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 500
                    }}
                  >
                    {isMobile ? `${account.slice(0, 12)}...${account.slice(-6)}` : account}
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>
        </Box>

        {loading && (
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              background: isDarkMode
                ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
            }}
          >
            <CardContent sx={{ py: 6 }}>
              <Stack direction="column" alignItems="center" spacing={3}>
                <Box sx={{ position: 'relative' }}>
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
                    <DatabaseOutlined sx={{ fontSize: 32 }} />
                  </Box>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: isDarkMode ? '#e0e0e0' : 'inherit',
                    fontWeight: 500
                  }}
                >
                  Loading your nodes...
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    color: isDarkMode ? '#b0b0b0' : 'inherit',
                    textAlign: 'center'
                  }}
                >
                  Fetching node data and staking information
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

      {account && mynodes.length > 0 && !loading && (
        <Stack direction="column" spacing={4} sx={{ width: '100%' }}>
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
                    {totalNodes}
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
                    {activeNodes}
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
                    ? 'linear-gradient(135deg, #c2185b 0%, #e91e63 100%)'
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  borderRadius: 4,
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDarkMode
                    ? '0 8px 32px rgba(194, 24, 91, 0.3)'
                    : '0 8px 32px rgba(240, 147, 251, 0.3)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDarkMode
                      ? '0 12px 40px rgba(194, 24, 91, 0.4)'
                      : '0 12px 40px rgba(240, 147, 251, 0.4)'
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
                    <ClockCircleOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.9,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        fontWeight: 500
                      }}
                    >
                      Inactive Nodes
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
                    {inactiveNodes}
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
                    <CrownOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.9,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        fontWeight: 500
                      }}
                    >
                      Staked Nodes
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
                    {stakedNodes}
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

          {/* Nodes Grid */}
          <Card
            sx={{
              borderRadius: '12px',
              boxShadow: isDarkMode
                ? '0 4px 12px rgba(0,0,0,0.3)'
                : '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <GlobalOutlined />
                <Typography variant="h6">Your Nodes</Typography>
              </Stack>
              <Grid container spacing={2}>
                {mynodes.map(renderNodeCard)}
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      )}

      {account && mynodes.length === 0 && !loading && (
        <Card
          sx={{
            textAlign: 'center',
            borderRadius: '12px',
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.1)',
            padding: '40px'
          }}
        >
          <CardContent>
            <Stack direction="column" alignItems="center" spacing={2}>
              <DatabaseOutlined sx={{ fontSize: 64, color: 'text.secondary' }} />
              <Typography variant="h6" sx={{ color: isDarkMode ? '#e0e0e0' : 'inherit' }}>
                No nodes found for your account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: isDarkMode ? '#b0b0b0' : 'inherit' }}>
                You haven't staked any nodes yet
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!account && (
        <Card
          sx={{
            textAlign: 'center',
            borderRadius: '12px',
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.1)',
            padding: '40px'
          }}
        >
          <CardContent>
            <Stack direction="column" alignItems="center" spacing={3}>
              <WalletOutlined sx={{ fontSize: 64, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ color: isDarkMode ? '#e0e0e0' : 'inherit' }}>
                Connect Your Wallet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ color: isDarkMode ? '#b0b0b0' : 'inherit' }}>
                Connect your Kadena wallet to view and manage your nodes
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<WalletOutlined />}
                onClick={() => initializeKadenaWallet("eckoWallet")}
                sx={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                    : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                  height: '48px',
                  fontSize: '16px',
                  padding: '0 32px',
                  borderRadius: '8px',
                  '&:hover': {
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)'
                      : 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)'
                  }
                }}
              >
                Connect Wallet
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
      </Container>
    </Box>
  );
};

export default MyNode;
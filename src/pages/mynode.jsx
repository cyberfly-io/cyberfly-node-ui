import React, { useEffect, useState } from 'react';
import { getMyNodes, getNodeStake } from '../services/pact-services';
import {
  Card, CardContent, CardActions, Button, Tooltip, Grid, Typography,
  Box, Chip, Avatar, CircularProgress, Divider, Stack, useTheme, useMediaQuery
} from '@mui/material';
import {
  Visibility as EyeOutlined,
  AccountTree as NodeIndexOutlined,
  EmojiEvents as CrownOutlined,
  Schedule as ClockCircleOutlined,
  Public as GlobalOutlined,
  Bolt as ThunderboltOutlined,
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
            borderRadius: '12px',
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.1)',
            background: isDarkMode
              ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: `1px solid ${isActive ? '#52c41a' : '#ff4d4f'}`,
            marginBottom: '16px',
            '&:hover': {
              boxShadow: isDarkMode
                ? '0 6px 20px rgba(0,0,0,0.4)'
                : '0 6px 20px rgba(0,0,0,0.15)'
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', padding: '16px' }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: isActive
                  ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                  : 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                marginBottom: '16px',
                mx: 'auto'
              }}
            >
              <NodeIndexOutlined />
            </Avatar>

            <Typography variant="h6" sx={{ margin: '8px 0', color: isDarkMode ? '#e0e0e0' : 'inherit' }}>
              Node {node.peer_id.slice(0, 8)}...
            </Typography>

            <Stack direction="column" spacing={1} sx={{ width: '100%' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ color: isDarkMode ? '#b0b0b0' : 'inherit' }}>
                  Peer ID
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: isDarkMode ? '#e0e0e0' : 'inherit',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => navigator.clipboard.writeText(node.peer_id)}
                >
                  {isMobile ? node.peer_id.slice(0, 15) + '...' : node.peer_id.slice(0, 20) + '...'}
                </Typography>
              </Box>

              <Divider sx={{ margin: '12px 0', borderColor: isDarkMode ? '#444' : '#f0f0f0' }} />

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip
                      icon={isActive ? <ThunderboltOutlined /> : <ClockCircleOutlined />}
                      label={isActive ? 'Active' : 'Inactive'}
                      color={isActive ? 'success' : 'error'}
                      size="small"
                      sx={{ marginBottom: '4px' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip
                      icon={isStaked ? <CrownOutlined /> : <DatabaseOutlined />}
                      label={isStaked ? 'Staked' : 'Unstaked'}
                      color={isStaked ? 'success' : 'default'}
                      size="small"
                      sx={{ marginBottom: '4px' }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {stakeInfo && (
                <Box sx={{ marginTop: '12px' }}>
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
            </Stack>
          </CardContent>

          <CardActions sx={{ justifyContent: 'center', paddingBottom: '16px' }}>
            <Tooltip title="View Details">
              <Button
                variant="contained"
                startIcon={<EyeOutlined />}
                onClick={() => navigate(`/node/${node.peer_id}`)}
                sx={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                    : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                  borderRadius: '6px',
                  '&:hover': {
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)'
                      : 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)'
                  }
                }}
              >
                View
              </Button>
            </Tooltip>
          </CardActions>
        </Card>
      </Grid>
    );
  };

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
        <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 3 }}>
          <DatabaseOutlined />
          <Typography variant="h5">My Nodes</Typography>
        </Stack>
        {account && (
          <Typography variant="body2" sx={{ px: 3, mt: 1, opacity: 0.8 }}>
            Connected Account: {isMobile ? account.slice(0, 12) + '...' : account.slice(0, 24) + '...'}
          </Typography>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ ml: 2 }}>Loading your nodes...</Typography>
        </Box>
      )}

      {account && mynodes.length > 0 && !loading && (
        <Stack direction="column" spacing={4} sx={{ width: '100%' }}>
          {/* Statistics Overview */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  textAlign: 'center',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                    <NodeIndexOutlined />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Nodes</Typography>
                  </Stack>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{totalNodes}</Typography>
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
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                    <ThunderboltOutlined />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Active Nodes</Typography>
                  </Stack>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{activeNodes}</Typography>
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
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                    <ClockCircleOutlined />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Inactive Nodes</Typography>
                  </Stack>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{inactiveNodes}</Typography>
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
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                    <CrownOutlined />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Staked Nodes</Typography>
                  </Stack>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stakedNodes}</Typography>
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
    </Box>
  );
};

export default MyNode;
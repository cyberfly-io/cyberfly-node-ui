import React, { useState, useEffect } from "react";
import { getNodeStake, getNode, getNodeClaimable, getAPY, claimReward, nodeStake, nodeUnStake } from "../services/pact-services";
import {
  Button, Card, CardContent, Typography, Box, Grid, Chip, Avatar,
  Stack, useTheme, useMediaQuery, Snackbar, Alert, CircularProgress, Container,
  Paper
} from "@mui/material";
import {
  CheckCircle as CheckCircleOutlined,
  Schedule as ClockCircleOutlined,
  AttachMoney as DollarOutlined,
  AccountBalanceWallet as WalletOutlined,
  AccountTree as NodeIndexOutlined,
  EmojiEvents as TrophyOutlined,
  ElectricBolt as ThunderboltOutlined,
  Public as GlobalOutlined,
  Person as UserOutlined,
  EmojiEvents as CrownOutlined,
  LocalFireDepartment as FireOutlined,
  CalendarToday as CalendarOutlined,
  CardGiftcard as GiftOutlined,
  ArrowUpward as ArrowUpOutlined,
  ArrowDownward as ArrowDownOutlined,
  Info as InfoCircleOutlined,
  Link as LinkOutlined
} from "@mui/icons-material";
import { useParams } from 'react-router-dom';
import { useKadenaWalletContext } from "../contexts/kadenaWalletContext";
import { useDarkMode } from '../contexts/DarkModeContext';
import ReactJson from "react-json-view";

const NodeDetail = () => {
  const { account, initializeKadenaWallet } = useKadenaWalletContext();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [nodeInfo, setNodeInfo] = useState(null);
  const [claimable, setClaimable] = useState(null);
  const [apy, setApy] = useState(null);
  const [nodeStakeInfo, setNodeStakeInfo] = useState(null);
  const [canStake, setCanStake] = useState(true);
  const [deadline, setDeadline] = useState(Date.now());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkMode } = useDarkMode();
  const { peerId } = useParams();

  const showMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    if (peerId) {
      getNode(peerId).then((data) => {
        setNodeInfo(data);
        console.log(data);
        getNodeStake(peerId).then((data) => {
          setNodeStakeInfo(data);

          if (data) {
            if (data.active)
              setCanStake(false);
            const originalDate = new Date(data.last_claim.timep);
            const nextTime = new Date(originalDate);
            nextTime.setHours(originalDate.getHours() + 6);
            setDeadline(nextTime);
          }
        });
      });

      getNodeClaimable(peerId).then((reward) => {
        if (reward)
          setClaimable(reward.reward);
      });

      getAPY().then((data) => {
        setApy(data);
      });
    }
  }, [peerId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            position: 'relative',
            zIndex: 1
          }}>
            <Avatar
              sx={{
                mr: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 56,
                height: 56
              }}
            >
              <NodeIndexOutlined sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  mb: 1,
                  fontWeight: 700,
                  fontSize: { xs: '1.8rem', md: '2.2rem' }
                }}
              >
                Node Details
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                Monitor and manage your Cyberfly network node
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Chip
              icon={<CheckCircleOutlined />}
              label="Real-time Monitoring"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Chip
              icon={<CheckCircleOutlined />}
              label="Network Status"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Chip
              icon={<CheckCircleOutlined />}
              label="Performance Metrics"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          </Box>
        </Paper>

      {!nodeInfo && (
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
                  <NodeIndexOutlined sx={{ fontSize: 32 }} />
                </Box>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: isDarkMode ? '#e0e0e0' : 'inherit',
                  fontWeight: 500
                }}
              >
                Loading node information...
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

      <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
        {/* Enhanced Node Overview Card */}
        {nodeInfo && (
          <Card
            sx={{
              borderRadius: 4,
              border: 'none',
              background: isDarkMode
                ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: isDarkMode
                  ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                  : '0 12px 40px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: isDarkMode
                      ? 'rgba(76, 175, 80, 0.2)'
                      : 'rgba(76, 175, 80, 0.1)',
                    color: '#4caf50'
                  }}
                >
                  <GlobalOutlined />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: isDarkMode ? '#ffffff' : '#2c3e50'
                  }}
                >
                  Node Overview
                </Typography>
                <Chip
                  icon={nodeInfo.status === 'active' ? <ThunderboltOutlined /> : <ClockCircleOutlined />}
                  label={nodeInfo.status === 'active' ? 'Online' : 'Offline'}
                  color={nodeInfo.status === 'active' ? 'success' : 'error'}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                />
              </Stack>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} sm={6} lg={4}>
                  <Box sx={{
                    textAlign: 'center',
                    padding: '16px',
                    background: isDarkMode ? '#1f1f1f' : 'white',
                    borderRadius: '8px'
                  }}>
                    <UserOutlined sx={{ fontSize: '24px', color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Account</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        mt: 1,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={() => navigator.clipboard.writeText(nodeInfo.account)}
                    >
                      {isMobile ? nodeInfo.account.slice(0, 20) + '...' : nodeInfo.account.slice(0, 32) + '...'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Box sx={{
                    textAlign: 'center',
                    padding: '16px',
                    background: isDarkMode ? '#1f1f1f' : 'white',
                    borderRadius: '8px'
                  }}>
                    <NodeIndexOutlined sx={{ fontSize: '24px', color: 'success.main', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Peer ID</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        mt: 1,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={() => navigator.clipboard.writeText(peerId)}
                    >
                      {isMobile ? peerId.slice(0, 20) + '...' : peerId.slice(0, 32) + '...'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Box sx={{
                    textAlign: 'center',
                    padding: '16px',
                    background: isDarkMode ? '#1f1f1f' : 'white',
                    borderRadius: '8px'
                  }}>
                    <GlobalOutlined sx={{ fontSize: '24px', color: 'warning.main', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Multiaddr</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        mt: 1,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={() => navigator.clipboard.writeText(nodeInfo.multiaddr)}
                    >
                      {isMobile ? nodeInfo.multiaddr.slice(0, 20) + '...' : nodeInfo.multiaddr.slice(0, 32) + '...'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Staking Information Card */}
        {nodeStakeInfo && (
          <Card sx={{
            borderRadius: '12px',
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2, gap: { xs: 1.5, sm: 0 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CrownOutlined />
                  <Typography variant="h6">Staking Dashboard</Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Chip
                    icon={<TrophyOutlined />}
                    label={`${apy}% APY`}
                    color="warning"
                  />
                  <Chip
                    icon={nodeStakeInfo.active ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    label={nodeStakeInfo.active ? 'Stake Active' : 'Stake Inactive'}
                    color={nodeStakeInfo.active ? 'success' : 'error'}
                  />
                </Stack>
              </Stack>

              <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
                {/* Enhanced Statistics Row */}
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
                          <DollarOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
                          <Typography
                            variant="body2"
                            sx={{
                              opacity: 0.9,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              fontWeight: 500
                            }}
                          >
                            Staked Amount
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
                          {nodeStakeInfo.amount} CFLY
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
                          ? 'linear-gradient(135deg, #7b1fa2 0%, #c2185b 100%)'
                          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        borderRadius: 4,
                        border: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: isDarkMode
                          ? '0 8px 32px rgba(123, 31, 162, 0.3)'
                          : '0 8px 32px rgba(240, 147, 251, 0.3)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: isDarkMode
                            ? '0 12px 40px rgba(123, 31, 162, 0.4)'
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
                          <GiftOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
                          <Typography
                            variant="body2"
                            sx={{
                              opacity: 0.9,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              fontWeight: 500
                            }}
                          >
                            Claimed Rewards
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
                          {nodeStakeInfo.claimed} CFLY
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
                        background: claimable > 0
                          ? (isDarkMode
                              ? 'linear-gradient(135deg, #0277bd 0%, #00acc1 100%)'
                              : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)')
                          : (isDarkMode
                              ? 'linear-gradient(135deg, #424242 0%, #616161 100%)'
                              : 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)'),
                        color: 'white',
                        borderRadius: 4,
                        border: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: claimable > 0
                          ? (isDarkMode
                              ? '0 8px 32px rgba(2, 119, 189, 0.3)'
                              : '0 8px 32px rgba(79, 172, 254, 0.3)')
                          : (isDarkMode
                              ? '0 8px 32px rgba(66, 66, 66, 0.3)'
                              : '0 8px 32px rgba(224, 224, 224, 0.3)'),
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: claimable > 0
                            ? (isDarkMode
                                ? '0 12px 40px rgba(2, 119, 189, 0.4)'
                                : '0 12px 40px rgba(79, 172, 254, 0.4)')
                            : (isDarkMode
                                ? '0 12px 40px rgba(66, 66, 66, 0.4)'
                                : '0 12px 40px rgba(224, 224, 224, 0.4)')
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
                          <FireOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
                          <Typography
                            variant="body2"
                            sx={{
                              opacity: 0.9,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              fontWeight: 500
                            }}
                          >
                            Claimable Rewards
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
                          {claimable || 0} CFLY
                        </Typography>
                        {claimable > 0 && account && nodeStakeInfo.active && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<GiftOutlined />}
                            sx={{
                              mt: 2,
                              background: 'rgba(255,255,255,0.2)',
                              border: '1px solid rgba(255,255,255,0.3)',
                              borderRadius: 2,
                              fontWeight: 600,
                              '&:hover': {
                                background: 'rgba(255,255,255,0.3)'
                              }
                            }}
                            onClick={() => {
                              claimReward(account, peerId, claimable).then(data => {
                                if (data) {
                                  showMessage("Reward claimed successfully!", "success");
                                }
                              });
                            }}
                          >
                            Claim
                          </Button>
                        )}
                        <Box
                          sx={{
                            width: '40px',
                            height: '3px',
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: 2,
                            mx: 'auto',
                            mt: claimable > 0 && account && nodeStakeInfo.active ? 1 : 1
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
                          <TrophyOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
                          <Typography
                            variant="body2"
                            sx={{
                              opacity: 0.9,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              fontWeight: 500
                            }}
                          >
                            Current APY
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
                          {apy}%
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

                {/* Enhanced Timeline Information */}
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        borderRadius: 4,
                        border: 'none',
                        background: isDarkMode
                          ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
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
                      <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 3 }}>
                          <CalendarOutlined sx={{ fontSize: { xs: 24, sm: 28 } }} />
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}
                          >
                            Last Claim
                          </Typography>
                        </Stack>
                        <Typography
                          variant="h4"
                          sx={{
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            mb: 2
                          }}
                        >
                          {formatDate(nodeStakeInfo.last_claim.timep)}
                        </Typography>
                        <Box
                          sx={{
                            width: '60px',
                            height: '4px',
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: 2,
                            mx: 'auto'
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        borderRadius: 4,
                        border: 'none',
                        background: isDarkMode
                          ? 'linear-gradient(135deg, #7b1fa2 0%, #c2185b 100%)'
                          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: isDarkMode
                          ? '0 8px 32px rgba(123, 31, 162, 0.3)'
                          : '0 8px 32px rgba(240, 147, 251, 0.3)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: isDarkMode
                            ? '0 12px 40px rgba(123, 31, 162, 0.4)'
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
                      <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 3 }}>
                          <ClockCircleOutlined sx={{ fontSize: { xs: 24, sm: 28 } }} />
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}
                          >
                            Stake Time
                          </Typography>
                        </Stack>
                        <Typography
                          variant="h4"
                          sx={{
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            mb: 2
                          }}
                        >
                          {formatDate(nodeStakeInfo.stake_time.timep)}
                        </Typography>
                        <Box
                          sx={{
                            width: '60px',
                            height: '4px',
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: 2,
                            mx: 'auto'
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Enhanced Countdown Timer */}
                {!(claimable > 0) && nodeStakeInfo.active && nodeInfo.status === "active" && (
                  <Card
                    sx={{
                      borderRadius: 4,
                      border: 'none',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
                        : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: 'white',
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
                    <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 3 }}>
                        <ClockCircleOutlined sx={{ fontSize: { xs: 24, sm: 28 } }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                          }}
                        >
                          Next Claim Countdown
                        </Typography>
                      </Stack>
                      <Typography
                        variant="h2"
                        sx={{
                          textAlign: 'center',
                          fontWeight: 800,
                          fontSize: { xs: '2.5rem', sm: '3rem' },
                          mb: 2,
                          fontFamily: 'monospace'
                        }}
                      >
                        {new Date(deadline - Date.now()).toISOString().substr(11, 8)}
                      </Typography>
                      <Box
                        sx={{
                          width: '80px',
                          height: '4px',
                          bgcolor: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: 2,
                          mx: 'auto'
                        }}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Action Buttons */}
                {account ? (
                  <Card
                    sx={{
                      borderRadius: 4,
                      border: 'none',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)'
                        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: isDarkMode
                          ? 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                          : 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          fontWeight: 700,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a',
                          textAlign: 'center'
                        }}
                      >
                        Node Management Actions
                      </Typography>
                      <Stack direction="row" justifyContent="center" spacing={3}>
                        {canStake ? (
                          <Button
                            fullWidth={isMobile}
                            variant="contained"
                            size="large"
                            startIcon={<ArrowUpOutlined />}
                            sx={{
                              background: isDarkMode
                                ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              height: 56,
                              fontSize: 16,
                              px: { xs: 3, sm: 5 },
                              borderRadius: 3,
                              fontWeight: 700,
                              width: { xs: '100%', sm: 'auto' },
                              boxShadow: isDarkMode
                                ? '0 4px 16px rgba(26, 35, 126, 0.3)'
                                : '0 4px 16px rgba(102, 126, 234, 0.3)',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                background: isDarkMode
                                  ? 'linear-gradient(135deg, #311b92 0%, #1a237e 100%)'
                                  : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: isDarkMode
                                  ? '0 8px 24px rgba(26, 35, 126, 0.4)'
                                  : '0 8px 24px rgba(102, 126, 234, 0.4)'
                              }
                            }}
                            onClick={() => {
                              nodeStake(account, peerId).then(data => {
                                if (data) {
                                  showMessage("Submitted, Please wait a while");
                                }
                              });
                            }}
                          >
                            Stake Node
                          </Button>
                        ) : (
                          <Button
                            fullWidth={isMobile}
                            variant="contained"
                            size="large"
                            startIcon={<ArrowDownOutlined />}
                            sx={{
                              background: isDarkMode
                                ? 'linear-gradient(135deg, #7b1fa2 0%, #c2185b 100%)'
                                : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                              height: 56,
                              fontSize: 16,
                              px: { xs: 3, sm: 5 },
                              borderRadius: 3,
                              fontWeight: 700,
                              width: { xs: '100%', sm: 'auto' },
                              boxShadow: isDarkMode
                                ? '0 4px 16px rgba(123, 31, 162, 0.3)'
                                : '0 4px 16px rgba(255, 107, 107, 0.3)',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                background: isDarkMode
                                  ? 'linear-gradient(135deg, #c2185b 0%, #7b1fa2 100%)'
                                  : 'linear-gradient(135deg, #ee5a52 0%, #ff6b6b 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: isDarkMode
                                  ? '0 8px 24px rgba(123, 31, 162, 0.4)'
                                  : '0 8px 24px rgba(255, 107, 107, 0.4)'
                              }
                            }}
                            onClick={() => {
                              nodeUnStake(account, peerId).then(data => {
                                if (data) {
                                  showMessage("Submitted, Please wait a while");
                                }
                              });
                            }}
                          >
                            Unstake Node
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ) : (
                  <Card
                    sx={{
                      textAlign: 'center',
                      borderRadius: 4,
                      border: 'none',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: isDarkMode
                          ? 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                          : 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
                      <Stack direction="column" alignItems="center" spacing={3}>
                        <Box sx={{ position: 'relative' }}>
                          <WalletOutlined sx={{ fontSize: 72, color: isDarkMode ? '#40a9ff' : '#1890ff' }} />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: isDarkMode
                                ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <LinkOutlined sx={{ fontSize: 14, color: 'white' }} />
                          </Box>
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: isDarkMode ? '#ffffff' : '#1a1a1a'
                          }}
                        >
                          Connect Your Wallet
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: isDarkMode ? '#b0b0b0' : '#666',
                            maxWidth: 400,
                            lineHeight: 1.6
                          }}
                        >
                          Connect your Kadena wallet to manage staking and claim rewards
                        </Typography>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<WalletOutlined />}
                          sx={{
                            background: isDarkMode
                              ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            height: '56px',
                            fontSize: '16px',
                            padding: '0 40px',
                            borderRadius: 3,
                            fontWeight: 700,
                            boxShadow: isDarkMode
                              ? '0 4px 16px rgba(26, 35, 126, 0.3)'
                              : '0 4px 16px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              background: isDarkMode
                                ? 'linear-gradient(135deg, #311b92 0%, #1a237e 100%)'
                                : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: isDarkMode
                                ? '0 8px 24px rgba(26, 35, 126, 0.4)'
                                : '0 8px 24px rgba(102, 126, 234, 0.4)'
                            }
                          }}
                          onClick={() => initializeKadenaWallet("eckoWallet")}
                        >
                          Connect Wallet
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Node Technical Details */}
        {nodeInfo && (
          <Card sx={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <InfoCircleOutlined />
                  <Typography variant="h6">Technical Details</Typography>
                </Stack>
                {canStake && !nodeStakeInfo && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CrownOutlined />}
                    onClick={() => {
                      nodeStake(account, peerId).then(data => {
                        if (data) {
                          showMessage("Submitted, Please wait a while");
                        }
                      });
                    }}
                  >
                    Stake Node
                  </Button>
                )}
              </Stack>

              <Stack direction="column" spacing={3}>
                {/* Guard Information */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <UserOutlined />
                    <Typography variant="h6">Guard Configuration</Typography>
                  </Stack>
                  <Card sx={{
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <CardContent>
                      <Box sx={{ maxHeight: { xs: 260, sm: 400 }, overflow: 'auto', pr: 1 }}>
                        <ReactJson
                          collapsed={isMobile}
                          src={nodeInfo.guard}
                          theme={isDarkMode ? 'apathy' : 'apathy:inverted'}
                          style={{ fontSize: '12px', wordBreak: 'break-word' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>

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
    </Container>
    </Box>
  );
};

export default NodeDetail;
import React, { useState, useEffect } from "react";
import { getNodeStake, getNode, getNodeClaimable, getAPY, claimReward, nodeStake, nodeUnStake } from "../services/pact-services";
import {
  Button, Card, CardContent, Typography, Box, Grid, Chip, Avatar, Divider,
  Stack, useTheme, useMediaQuery, Snackbar, Alert, CircularProgress
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
  Info as InfoCircleOutlined
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <NodeIndexOutlined />
            <Typography variant="h5">Node Details</Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            {nodeInfo && (
              <Chip
                icon={nodeInfo.status === 'active' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                label={nodeInfo.status === 'active' ? 'Active' : 'Inactive'}
                color={nodeInfo.status === 'active' ? 'success' : 'error'}
                sx={{ fontSize: '14px', padding: '4px 12px' }}
              />
            )}
            {apy && (
              <Chip
                icon={<TrophyOutlined />}
                label={`${apy}% APY`}
                color="warning"
                sx={{ fontSize: '14px', padding: '4px 12px' }}
              />
            )}
          </Stack>
        </Stack>
        {peerId && (
          <Typography variant="body2" sx={{ px: 3, mt: 1, opacity: 0.8 }}>
            Peer ID: {isMobile ? peerId.slice(0, 12) + '...' : peerId.slice(0, 24) + '...'}
          </Typography>
        )}
      </Box>

      {!nodeInfo && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Loading node information...</Typography>
        </Box>
      )}

      <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
        {/* Node Overview Card */}
        {nodeInfo && (
          <Card
            sx={{
              borderRadius: '12px',
              boxShadow: isDarkMode
                ? '0 4px 12px rgba(0,0,0,0.3)'
                : '0 4px 12px rgba(0,0,0,0.1)',
              background: isDarkMode
                ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
                : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <GlobalOutlined />
                <Typography variant="h6">Node Overview</Typography>
                <Chip
                  icon={nodeInfo.status === 'active' ? <ThunderboltOutlined /> : <ClockCircleOutlined />}
                  label={nodeInfo.status === 'active' ? 'Online' : 'Offline'}
                  color={nodeInfo.status === 'active' ? 'success' : 'error'}
                />
              </Stack>

              <Grid container spacing={3}>
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
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
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
                {/* Statistics Row */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} lg={3}>
                    <Card sx={{
                      textAlign: 'center',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '12px'
                    }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                          <DollarOutlined />
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>Staked Amount</Typography>
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {nodeStakeInfo.amount} CFLY
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <Card sx={{
                      textAlign: 'center',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #7b1fa2 0%, #c2185b 100%)'
                        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      borderRadius: '12px'
                    }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                          <GiftOutlined />
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>Claimed Rewards</Typography>
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {nodeStakeInfo.claimed} CFLY
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <Card sx={{
                      textAlign: 'center',
                      background: claimable > 0
                        ? (isDarkMode
                            ? 'linear-gradient(135deg, #0277bd 0%, #00acc1 100%)'
                            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)')
                        : (isDarkMode
                            ? 'linear-gradient(135deg, #424242 0%, #616161 100%)'
                            : 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)'),
                      color: 'white',
                      borderRadius: '12px'
                    }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                          <FireOutlined />
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>Claimable Rewards</Typography>
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
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
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <Card sx={{
                      textAlign: 'center',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
                        : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: 'white',
                      borderRadius: '12px'
                    }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                          <TrophyOutlined />
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>Current APY</Typography>
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {apy}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Timeline Information */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ borderRadius: '8px' }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <CalendarOutlined />
                          <Typography variant="h6">Last Claim</Typography>
                        </Stack>
                        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                          {formatDate(nodeStakeInfo.last_claim.timep)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ borderRadius: '8px' }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <CalendarOutlined />
                          <Typography variant="h6">Stake Time</Typography>
                        </Stack>
                        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                          {formatDate(nodeStakeInfo.stake_time.timep)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Countdown Timer */}
                {!(claimable > 0) && nodeStakeInfo.active && nodeInfo.status === "active" && (
                  <Card sx={{
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <ClockCircleOutlined />
                        <Typography variant="h6">Next Claim Countdown</Typography>
                      </Stack>
                      <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {new Date(deadline - Date.now()).toISOString().substr(11, 8)}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                {account ? (
                  <Card sx={{
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                  }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="center" spacing={3}>
                        {canStake ? (
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={<ArrowUpOutlined />}
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              height: '48px',
                              fontSize: '16px',
                              padding: '0 32px',
                              borderRadius: '8px',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
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
                            variant="contained"
                            color="error"
                            size="large"
                            startIcon={<ArrowDownOutlined />}
                            sx={{
                              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                              height: '48px',
                              fontSize: '16px',
                              padding: '0 32px',
                              borderRadius: '8px',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #ee5a52 0%, #ff6b6b 100%)'
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
                  <Card sx={{
                    textAlign: 'center',
                    borderRadius: '12px',
                    boxShadow: isDarkMode
                      ? '0 4px 12px rgba(0,0,0,0.3)'
                      : '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '40px'
                  }}>
                    <CardContent>
                      <Stack direction="column" alignItems="center" spacing={3}>
                        <WalletOutlined sx={{ fontSize: 64, color: 'primary.main' }} />
                        <Typography variant="h4">Connect Your Wallet</Typography>
                        <Typography variant="body1" color="text.secondary">
                          Connect your Kadena wallet to manage staking and claim rewards
                        </Typography>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<WalletOutlined />}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            height: '48px',
                            fontSize: '16px',
                            padding: '0 32px',
                            borderRadius: '8px',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
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
                      <ReactJson
                        collapsed={isMobile}
                        src={nodeInfo.guard}
                        theme={isDarkMode ? 'apathy' : 'apathy:inverted'}
                        style={{ fontSize: '12px' }}
                      />
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
    </Box>
  );
};

export default NodeDetail;
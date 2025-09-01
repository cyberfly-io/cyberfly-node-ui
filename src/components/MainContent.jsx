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
  Divider,
  Button,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Avatar,
  Tooltip,
  LinearProgress,
  IconButton,
  Collapse
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
  EmojiEvents as TrophyIcon,
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
        ),
        children: (
          <Card size="small" sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Stack spacing={2} sx={{ width: '100%' }}>
                <div>
                  <Typography variant="body2" color="text.secondary" component="span">Peer ID: </Typography>
                  <Typography
                    variant="body2"
                    sx={{ display: 'inline', wordBreak: 'break-all', fontFamily: 'monospace' }}
                  >
                    {item.remotePeer}
                  </Typography>
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(item.remotePeer)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </div>
                <div>
                  <Typography variant="body2" color="text.secondary" component="span">Address: </Typography>
                  <Typography
                    variant="body2"
                    component="a"
                    href={getIPFromMultiAddr(item.remoteAddr)}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: 'primary.main', textDecoration: 'none' }}
                  >
                    {item.remoteAddr}
                  </Typography>
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(item.remoteAddr)} sx={{ ml: 1 }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </div>
                <div>
                  <Typography variant="body2" color="text.secondary" component="span">Status: </Typography>
                  <Chip
                    icon={<ThunderboltIcon />}
                    label="Active"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </div>
              </Stack>
            </CardContent>
          </Card>
        ),
      }));
      setPeerItems(items);
    }
  }, [peers]);

  // Calculate network health percentage
  const networkHealth = Math.min(100, (cCount / Math.max(activeNodes, 1)) * 100);

  return (
    <Container maxWidth="xl">
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: isDarkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          color: 'white'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <PublicIcon />
          <Typography variant="h4" component="h1">
            Network Dashboard
          </Typography>
        </Stack>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Real-time node and network statistics
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {version && (
            <Chip
              icon={<InfoIcon />}
              label={`v${version}`}
              color="primary"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          )}
        </Stack>
      </Paper>

      <Stack spacing={3} sx={{ width: '100%' }}>
        {/* Node Information Card */}
        {nodeInfo && (
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <DeploymentUnitIcon color="primary" />
                <Typography variant="h6">Node Information</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={nodeInfo?.health === 'ok' ? 'Active' : 'Inactive'}
                    color={nodeInfo?.health === 'ok' ? 'success' : 'error'}
                    size="small"
                  />
                  <Button
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/node/${nodeInfo?.peerId}`)}
                    size="small"
                    variant="outlined"
                  >
                    View Details
                  </Button>
                </Stack>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="body2" color="text.secondary">Peer ID</Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ wordBreak: 'break-all', fontFamily: 'monospace', flexGrow: 1 }}
                    >
                      {nodeInfo?.peerId}
                    </Typography>
                    <IconButton size="small" onClick={() => navigator.clipboard.writeText(nodeInfo?.peerId)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="body2" color="text.secondary">Account</Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ wordBreak: 'break-all', fontFamily: 'monospace', flexGrow: 1 }}
                    >
                      {nodeInfo?.account}
                    </Typography>
                    <IconButton size="small" onClick={() => navigator.clipboard.writeText(nodeInfo?.account)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="body2" color="text.secondary">Version</Typography>
                  <Chip label={`v${version}`} color="primary" size="small" sx={{ mt: 1 }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Network Statistics Card */}
        <Card elevation={2}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <RadarChartIcon color="primary" />
              <Typography variant="h6">Network Statistics</Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={4}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">Connected Peers</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ApartmentIcon color="primary" />
                    <Typography variant="h4" color="primary.main">{cCount}</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">Discovered Peers</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <WifiIcon color="success" />
                    <Typography variant="h4" color="success.main">{dCount}</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">Active Nodes</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PublicIcon color="warning" />
                    <Typography variant="h4" color="warning.main">{activeNodes}</Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Staking Information Card */}
        <Card elevation={2}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <LockIcon color="primary" />
              <Typography variant="h6">Staking Overview</Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={4}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">Total Stakes</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ApiIcon color="success" />
                    <Typography variant="h4" color="success.main">{stakesCount}</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">Locked Supply</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <DollarIcon color="warning" />
                    <Typography variant="h4" color="warning.main">{locked}</Typography>
                    <Typography variant="body2" color="text.secondary">CFLY</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">Reward Rate</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PercentIcon color="secondary" />
                    <Typography variant="h4" color="secondary.main">{apy}</Typography>
                    <Typography variant="body2" color="text.secondary">% APY</Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Connected Peers Card */}
        <Card elevation={2}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <WifiIcon color="primary" />
              <Typography variant="h6">Connected Peers</Typography>
              <Badge badgeContent={cCount} color="success" />
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {dCount} discovered • {cCount} connected
              </Typography>
            </Stack>

            {peerItems.length > 0 ? (
              <Stack spacing={1}>
                {peerItems.map((item, index) => (
                  <Accordion key={item.key} elevation={1}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`peer-${index}-content`}
                      id={`peer-${index}-header`}
                    >
                      {item.label}
                    </AccordionSummary>
                    <AccordionDetails>
                      {item.children}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            ) : (
              <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
                <WifiIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                <Typography variant="body2" color="text.secondary">
                  No peers connected
                </Typography>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Network Status Footer */}
        <Card elevation={1} sx={{ bgcolor: 'grey.50' }}>
          <CardContent>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PublicIcon color="primary" />
                  <Typography variant="body1" fontWeight="bold">Network Status</Typography>
                  <Badge color="success" variant="dot" />
                  <Typography variant="body2" color="success.main">Operational</Typography>
                </Stack>
              </Grid>
              <Grid item>
                <Typography variant="body2" color="text.secondary">
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

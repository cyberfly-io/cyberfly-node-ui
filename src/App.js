import React, { useState } from 'react'
import { Route, BrowserRouter, Routes, Link } from 'react-router-dom';
import Tools from './pages/db-tools'
import Settings from './pages/settings'
import "./App.css"
import MainContent from './components/MainContent'
import { useDarkMode } from './contexts/DarkModeContext';
import PubSubPage from './pages/pubsub';
import defaultProps from './components/defaultprops';
import { Brightness4, Brightness7, AccountCircle, AccountBalanceWallet, Menu, MenuOpen, Hub, NetworkCheck, Security } from '@mui/icons-material'
import { useKadenaWalletContext } from "./contexts/kadenaWalletContext";
import { TrackerCard } from '@kadena/kode-ui';
import Dialer from './pages/dialer';
import NodeMap from './pages/node-map';
import MyNode from './pages/mynode';
import Faucet from './pages/faucet';
import Files from './pages/files';
import KadenaTools from './pages/kadena-tools';
import NodeList from './pages/nodelist';
import NodeDetail from './pages/node';
import BLEPage from './pages/ble';
import StreamPage from './pages/stream';
import BridgeMonitor from './pages/bridge-monitor';
import {
  Box,
  Button,
  Avatar,
  Menu as MuiMenu,
  MenuItem,
  Modal,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';



const App = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const bg = isDarkMode
    ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)"
    : "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)";
  const muiTheme = useTheme();

  const showModal = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const {initializeKadenaWallet, account, disconnectWallet  } = useKadenaWalletContext()

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleWalletClick = () => {
    if (account) {
      showModal();
    } else {
      initializeKadenaWallet("eckoWallet");
    }
    handleMenuClose();
  };

  const menuItems = [
    {
      label: account ? 'Account' : 'EckoWallet',
      key: '0',
      onClick: handleWalletClick,
      icon: account ? <AccountCircle /> : <Avatar sx={{ width: 24, height: 24 }} src="https://wallet.ecko.finance/icon_eckoWALLET.svg?v=2" />
    },
  ];

  return (
    <BrowserRouter>
      <ThemeProvider theme={createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: { main: '#0061ff' },
          secondary: { main: '#00ff87' },
        },
      })}>
        <CssBaseline />
        <Box sx={{ display: 'flex' }}>
          {/* App Bar */}
          <AppBar position="fixed" sx={{
            zIndex: muiTheme.zIndex.drawer + 1,
            background: bg,
            boxShadow: isDarkMode
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <Toolbar sx={{ minHeight: 64 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => setDrawerOpen(!drawerOpen)}
                edge="start"
                sx={{
                  mr: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {drawerOpen ? <MenuOpen /> : <Menu />}
              </IconButton>

              {/* Enhanced Logo Section */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                mr: 2
              }}>
             
                
                  <img
                    src="https://cyberfly.io/assets/images/newlogo.png"
                    alt="Cyberfly Network"
                    style={{
                      height: 52,
                      width: 'auto',
                      filter: 'brightness(1.1)'
                    }}
                  />
              

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      lineHeight: 1.2,
                      background: 'linear-gradient(45deg, #ffffff 30%, #00ff87 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Cyberfly Network
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <NetworkCheck sx={{
                      fontSize: 14,
                      mr: 0.5,
                      color: '#60efff'
                    }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.7rem'
                      }}
                    >
                      Connect Everything
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={toggleDarkMode}
                  color="inherit"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>

                <IconButton
                  onClick={handleMenuClick}
                  color="inherit"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  title="Wallet & Account"
                >
                  <AccountBalanceWallet />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Navigation Drawer */}
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              width: 280,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 280,
                boxSizing: 'border-box',
                background: isDarkMode
                  ? 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
                borderRight: isDarkMode
                  ? '1px solid rgba(255,255,255,0.1)'
                  : '1px solid rgba(0,0,0,0.08)',
                boxShadow: isDarkMode
                  ? '4px 0 20px rgba(0, 0, 0, 0.3)'
                  : '4px 0 20px rgba(0, 0, 0, 0.1)'
              },
            }}
          >
            <Toolbar sx={{
              minHeight: 64,
              borderBottom: isDarkMode
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid rgba(0,0,0,0.08)',
              background: isDarkMode
                ? 'rgba(0, 0, 0, 0.2)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%'
              }}>
                     <img
                    src="https://cyberfly.io/assets/images/newlogo.png"
                    alt="Cyberfly Node"
                    style={{
                      height: 52,
                      width: 'auto',
                      filter: 'brightness(1.1)'
                    }}
                  />
             
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #0061ff 30%, #00ff87 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Cyberfly
                </Typography>
              </Box>
            </Toolbar>
            <Box sx={{ overflow: 'auto', flex: 1 }}>
              <List sx={{ pt: 1 }}>
                {defaultProps.route.routes.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      onClick={() => {
                        setDrawerOpen(false);
                      }}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: isDarkMode
                            ? 'rgba(0, 255, 135, 0.1)'
                            : 'rgba(0, 97, 255, 0.08)',
                          transform: 'translateX(4px)',
                          '& .MuiListItemIcon-root': {
                            color: '#00ff87'
                          }
                        },
                        '&.Mui-selected': {
                          backgroundColor: isDarkMode
                            ? 'rgba(0, 255, 135, 0.15)'
                            : 'rgba(0, 97, 255, 0.12)',
                          '& .MuiListItemIcon-root': {
                            color: '#00ff87'
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{
                        minWidth: 40,
                        color: isDarkMode ? '#b0b0b0' : '#666',
                        transition: 'color 0.2s ease'
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        sx={{
                          '& .MuiTypography-root': {
                            fontWeight: 500,
                            color: isDarkMode ? '#e0e0e0' : '#333'
                          }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>

          {/* Main Content */}
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path='/mynode' element={<MyNode/>} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/files" element={<Files />} />
              <Route path='/pubsub' element={<PubSubPage/>} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dialer" element={<Dialer />} />
              <Route path='/ble' element={<BLEPage />} />
              <Route path="/map" element={<NodeMap />} />
              <Route path="/faucet" element={<Faucet />} />
              <Route path="/kadena-tools" element={<KadenaTools />} />
              <Route path="/nodes" element={<NodeList />} />
              <Route path="/node/:peerId" element={<NodeDetail />} />
               <Route path="/stream" element={<StreamPage />} /> 
               <Route path="/bridge" element={<BridgeMonitor />} />
            </Routes>
          </Box>

          {/* Wallet Menu */}
          <MuiMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {menuItems.map((item) => (
              <MenuItem key={item.key} onClick={item.onClick}>
                {item.icon}
                <Typography sx={{ ml: 1 }}>{item.label}</Typography>
              </MenuItem>
            ))}
          </MuiMenu>

          {/* Account Modal */}
          <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="account-modal"
          >
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
            }}>
              <Typography id="account-modal" variant="h6" component="h2">
                Account
              </Typography>
              <TrackerCard
                icon="KadenaOverview"
                labelValues={[
                  {
                    isAccount: true,
                    label: 'Account',
                    value: account
                  },
                ]}
                variant="horizontal"
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
                <Button onClick={() => {
                  onClose();
                  disconnectWallet();
                }} variant="contained">LogOut</Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

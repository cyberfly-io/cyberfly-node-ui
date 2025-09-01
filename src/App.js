import React, { useState } from 'react'
import { Route, BrowserRouter, Routes, Link } from 'react-router-dom';
import Tools from './pages/db-tools'
import Settings from './pages/settings'
import "./App.css"
import MainContent from './components/MainContent'
import { useDarkMode } from './contexts/DarkModeContext';
import PubSubPage from './pages/pubsub';
import defaultProps from './components/defaultprops';
import { Brightness4, Brightness7, AccountCircle, AccountBalanceWallet, Menu, MenuOpen } from '@mui/icons-material'
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
  const [pathname, setPathname] = useState('/');
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const bg = isDarkMode ? "linear-gradient(135deg, #000066 0%, #003366 50%, #004d4d 100%)" : "linear-gradient(135deg, #0061ff 0%, #60efff 50%, #00ff87  100%);";
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
          <AppBar position="fixed" sx={{ zIndex: muiTheme.zIndex.drawer + 1, background: bg }}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => setDrawerOpen(!drawerOpen)}
                edge="start"
              >
                {drawerOpen ? <MenuOpen /> : <Menu />}
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                <img src="https://cyberfly.io/assets/images/newlogo.png" alt="Cyberfly Node" style={{ height: 40, marginRight: 10 }} />
                Cyberfly Node
              </Typography>
              <IconButton onClick={toggleDarkMode} color="inherit">
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <IconButton onClick={handleMenuClick} color="inherit">
                <AccountBalanceWallet />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Navigation Drawer */}
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              width: 240,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 240,
                boxSizing: 'border-box',
              },
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
              <List>
                {defaultProps.route.routes.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      onClick={() => {
                        setPathname(item.path || '/');
                        setDrawerOpen(false);
                      }}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.name} />
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

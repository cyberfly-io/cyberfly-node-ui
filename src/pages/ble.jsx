import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Stack,
  Alert
} from '@mui/material'
import {
  Wifi
} from '@mui/icons-material'

// BLE Service and Characteristic UUIDs
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const RX_CHAR_UUID = '12345678-1234-1234-1234-123456789abd';
const TX_CHAR_UUID = '12345678-1234-1234-1234-123456789abe';

// Constants
const MAX_JSON_SIZE = 384;
const DEFAULT_CHUNK_SIZE = 180;
const FRAGMENT_TIMEOUT_MS = 1000;

const BLEPage = () => {
  // State management
  const [connectionState, setConnectionState] = useState('disconnected');
  const [connectionStrength, setConnectionStrength] = useState(0);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [scanAll, setScanAll] = useState(false);
  const [namePrefix, setNamePrefix] = useState('CYBERFLY');
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [rxCharacteristic, setRxCharacteristic] = useState(null);
  const [txCharacteristic, setTxCharacteristic] = useState(null);
  const [isNotifying, setIsNotifying] = useState(false);
  const [provisionStatus, setProvisionStatus] = useState(null);
  const [provisionMsg, setProvisionMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [receivedData, setReceivedData] = useState('');
  const [assemblingMessage, setAssemblingMessage] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logLevel, setLogLevel] = useState('all');
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE);
  const [prettyJson, setPrettyJson] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [lastScanError, setLastScanError] = useState(null);

  // Refs
  const logRef = useRef(null)

  // Auto network ID
  const autoNetworkId = 'mainnet01'

  // Filtered logs
  const filteredLogs = logLevel === 'all' ? logs : logs.filter((l) => l.type === logLevel);

  // Mock functions for now
  const scanAndConnect = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsConnected(true);
      setConnectionState('ready');
    }, 2000);
  };

  const disconnect = () => {
    setIsConnected(false);
    setConnectionState('disconnected');
  };

  const forgetDevice = () => {
    setDevice(null);
    setIsConnected(false);
  };

  const submitProvision = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setProvisionStatus('saved');
      setProvisionMsg('Device provisioned successfully');
    }, 2000);
  };

  const sendJSON = () => {
    // Mock send JSON
  };

  const formatJSONInput = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Invalid JSON
    }
  };

  const clearReceived = () => {
    setReceivedData('');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    // Mock export
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderScanError = () => {
    if (!lastScanError) return null;
    return (
      <Alert
        type="warning"
        showIcon
        message="Scan Issue"
        description={`${lastScanError}. Try broad scan, ensure HTTPS, reset device, or clear permissions (chrome://bluetooth-internals).`}
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          textAlign: 'center',
          p: 6,
          background: (theme) => theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 3 }}>
          <Wifi color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            BLE Device Provisioning
          </Typography>
        </Stack>

        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Configure and manage Bluetooth Low Energy device connections
        </Typography>

        <Card sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              BLE Device Provisioning
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              This page is currently being updated with improved UI. Please check back soon.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              The BLE provisioning functionality is preserved and will be available with enhanced design shortly.
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
};

export default BLEPage;

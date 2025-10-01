import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Wifi,
  BluetoothConnected,
  BluetoothDisabled,
  BluetoothSearching,
  Refresh,
  AssignmentTurnedIn,
} from '@mui/icons-material';
import GradientHeader from '../components/GradientHeader';

const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const RX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const TX_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

const MAX_JSON_SIZE = 384;
const FRAGMENT_TIMEOUT_MS = 2000;
const DEFAULT_CHUNK_SIZE = 180;
const ATT_PAYLOAD_CHUNK_SIZE = 20;
const CHUNK_DELAY_MS = 35;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const DEFAULT_DEVICE_CONFIG = {
  device_id: '',
  ssid: '',
  wifi_password: '',
  network_id: '',
  publicKey: '',
  secretKey: '',
};

const formatTimestamp = (date) =>
  date
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/^0/, '');

function sanitizeChunk(dataView) {
  if (!dataView) return '';
  const arr = new Uint8Array(dataView.buffer.slice(dataView.byteOffset, dataView.byteOffset + dataView.byteLength));
  const filtered = arr.filter((byte) => byte !== 0);
  if (!filtered.length) return '';
  return decoder.decode(filtered);
}

function trimToLength(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) : str;
}

function unwrapPotentiallyQuotedJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === 'string' ? parsed : trimmed;
    } catch (err) {
      return trimmed;
    }
  }
  return trimmed;
}

function isCompleteJsonCandidate(text) {
  if (!text) return false;
  const stripped = unwrapPotentiallyQuotedJson(text).trim();
  if (!stripped.startsWith('{') || !stripped.endsWith('}')) return false;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = 0; i < stripped.length; i += 1) {
    const ch = stripped[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth < 0) return false;
    }
  }
  return depth === 0;
}

function computePayloadBytes(payload) {
  try {
    return encoder.encode(JSON.stringify(payload)).length;
  } catch (err) {
    return Infinity;
  }
}

const BLEPage = () => {
  const [supported, setSupported] = useState(true);
  const [connectionStep, setConnectionStep] = useState('idle');
  const [statusBadge, setStatusBadge] = useState('Waiting to connect');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deviceConfig, setDeviceConfig] = useState(() => ({ ...DEFAULT_DEVICE_CONFIG }));
  const [logs, setLogs] = useState([]);
  const [savingDevice, setSavingDevice] = useState(false);

  const devicePayloadPreview = useMemo(() => {
    const base = {
      device_id: trimToLength(deviceConfig.device_id, 64),
      ssid: trimToLength(deviceConfig.ssid, 32),
      wifi_password: trimToLength(deviceConfig.wifi_password, 64),
      network_id: trimToLength(deviceConfig.network_id, 32),
      key_pair: {
        publicKey: trimToLength(deviceConfig.publicKey, 128),
      },
    };
    const secret = trimToLength(deviceConfig.secretKey, 128);
    if (secret) {
      base.key_pair.secretKey = secret;
    }
    return base;
  }, [deviceConfig]);

  const devicePayloadBytes = useMemo(() => computePayloadBytes(devicePayloadPreview), [devicePayloadPreview]);

  const deviceRef = useRef(null);
  const serverRef = useRef(null);
  const rxCharacteristicRef = useRef(null);
  const txCharacteristicRef = useRef(null);
  const bufferRef = useRef({ text: '', lastTs: 0 });

  const appendLog = useCallback((message, meta = {}) => {
    setLogs((prev) => {
      const next = prev.length > 200 ? prev.slice(prev.length - 200) : [...prev];
      next.push({ ts: new Date(), message, meta });
      return next;
    });
  }, []);

  const resetBuffer = useCallback(() => {
    bufferRef.current = { text: '', lastTs: Date.now() };
  }, []);

  const handleParsedMessage = useCallback(
    (payload) => {
      if (!payload || typeof payload !== 'object') {
        appendLog(`Received raw payload: ${JSON.stringify(payload)}`);
        return;
      }
      const status = payload.status;
      if (!status) {
        appendLog(`Received data: ${JSON.stringify(payload)}`);
        return;
      }

      switch (status) {
        case 'ready':
          setStatusBadge('Device ready for provisioning');
          appendLog('Device reported ready state');
          break;
        case 'saved':
          setStatusBadge('Device configuration saved');
          setSuccessMessage('Device configuration saved successfully!');
          appendLog('Device configuration saved successfully');
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
          break;
        case 'sensor_ready':
          setStatusBadge('Sensor setup mode reported');
          appendLog('Device entered sensor provisioning mode (sensor UI disabled).');
          break;
        case 'sensor_saved':
          setStatusBadge('Sensor configuration saved');
          appendLog('Sensor configuration saved (no UI actions performed).');
          break;
        case 'setup_complete':
          setStatusBadge('Setup complete');
          appendLog('Provisioning complete');
          break;
        case 'error':
          setStatusBadge('Device reported an error');
          appendLog(`Device error: ${payload.msg || 'Unknown error'}`, { severity: 'error' });
          setErrorMessage(payload.msg || 'Device reported an error');
          break;
        default:
          appendLog(`Status update: ${status}`);
      }
    },
    [appendLog, setStatusBadge],
  );

  const flushBufferIfComplete = useCallback(() => {
    const current = bufferRef.current;
    if (!current.text) return;
    if (!isCompleteJsonCandidate(current.text)) return;
    try {
      const unwrapped = unwrapPotentiallyQuotedJson(current.text);
      const parsed = JSON.parse(unwrapped);
      handleParsedMessage(parsed);
    } catch (err) {
      appendLog(`Failed to parse incoming JSON: ${err?.message || err}`, { severity: 'error' });
    } finally {
      resetBuffer();
    }
  }, [appendLog, handleParsedMessage, resetBuffer]);

  const appendFragment = useCallback(
    (fragment) => {
      if (!fragment) return;
      const now = Date.now();
      const buffer = bufferRef.current;
      if (buffer.lastTs && now - buffer.lastTs > FRAGMENT_TIMEOUT_MS) {
        buffer.text = '';
      }
      const trimmedFragment = fragment.trimStart();
      if (trimmedFragment.startsWith('{')) {
        buffer.text = '';
      }
      const combined = `${buffer.text}${fragment}`;
      buffer.text = combined.length > MAX_JSON_SIZE ? combined.slice(-MAX_JSON_SIZE) : combined;
      buffer.lastTs = now;
      flushBufferIfComplete();
    },
    [flushBufferIfComplete],
  );

  const handleCharacteristicValueChanged = useCallback(
    (event) => {
      const chunk = sanitizeChunk(event?.target?.value);
      if (!chunk) return;
      appendLog(`RX: ${chunk}`);
      appendFragment(chunk);
    },
    [appendFragment, appendLog],
  );

  const cleanupConnection = useCallback(() => {
    const device = deviceRef.current;
    if (device) {
      device.removeEventListener('gattserverdisconnected', cleanupConnection);
    }
    const characteristic = txCharacteristicRef.current;
    if (characteristic) {
      try {
        characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        characteristic.stopNotifications();
      } catch (err) {
        // ignore
      }
    }
    deviceRef.current = null;
    serverRef.current = null;
    rxCharacteristicRef.current = null;
    txCharacteristicRef.current = null;
    resetBuffer();
  }, [handleCharacteristicValueChanged, resetBuffer]);

  const disconnect = useCallback(async () => {
    try {
      if (serverRef.current?.connected) {
        await serverRef.current.disconnect();
      }
      if (deviceRef.current?.gatt?.connected) {
        await deviceRef.current.gatt.disconnect();
      }
    } catch (err) {
      appendLog(`Disconnect error: ${err.message || err}`, { severity: 'error' });
    } finally {
      cleanupConnection();
      setConnectionStep('disconnected');
      setStatusBadge('Disconnected');
    }
  }, [appendLog, cleanupConnection]);

  const handleDeviceDisconnected = useCallback(() => {
    appendLog('Device disconnected');
    cleanupConnection();
    setConnectionStep('disconnected');
    setStatusBadge('Device disconnected');
  }, [appendLog, cleanupConnection]);

  const connect = useCallback(async () => {
    setErrorMessage('');
    if (!navigator.bluetooth) {
      setSupported(false);
      setErrorMessage('Web Bluetooth API not available in this browser. Use Chrome-based browser.');
      return;
    }
    await disconnect();
    try {
      setConnectionStep('requesting');
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [SERVICE_UUID] },
          { namePrefix: 'CYBERFLY' },
        ],
        optionalServices: [SERVICE_UUID],
      });
      appendLog(`Selected device: ${device.name || 'Unnamed device'}`);
      deviceRef.current = device;
      device.addEventListener('gattserverdisconnected', handleDeviceDisconnected);

      setConnectionStep('connecting');
      const server = await device.gatt.connect();
      serverRef.current = server;

      const service = await server.getPrimaryService(SERVICE_UUID);
      const rxChar = await service.getCharacteristic(RX_CHAR_UUID);
      const txChar = await service.getCharacteristic(TX_CHAR_UUID);

      await txChar.startNotifications();
      txChar.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      rxCharacteristicRef.current = rxChar;
      txCharacteristicRef.current = txChar;
      resetBuffer();

      setConnectionStep('connected');
      setStatusBadge('Connected to device');
      appendLog('Connected to BLE service');
    } catch (err) {
      appendLog(`Connection failed: ${err.message || err}`, { severity: 'error' });
      setErrorMessage(err.message || 'Failed to connect');
      await disconnect();
      setConnectionStep('error');
      setStatusBadge('Connection error');
    }
  }, [appendLog, disconnect, handleCharacteristicValueChanged, handleDeviceDisconnected, resetBuffer]);

  const sendJson = useCallback(
    async (payload) => {
      if (!rxCharacteristicRef.current) {
        throw new Error('Not connected to BLE device');
      }
      const jsonString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      if (jsonString.length > MAX_JSON_SIZE) {
        throw new Error(`JSON payload exceeds ${MAX_JSON_SIZE} characters.`);
      }
      const bytes = encoder.encode(jsonString);
      let offset = 0;
      while (offset < bytes.length) {
        const end = Math.min(offset + DEFAULT_CHUNK_SIZE, bytes.length);
        for (let cursor = offset; cursor < end; cursor += ATT_PAYLOAD_CHUNK_SIZE) {
          const innerEnd = Math.min(cursor + ATT_PAYLOAD_CHUNK_SIZE, end);
          const chunk = bytes.slice(cursor, innerEnd);
          const characteristic = rxCharacteristicRef.current;
          try {
            if (typeof characteristic.writeValueWithoutResponse === 'function') {
              await characteristic.writeValueWithoutResponse(chunk);
            } else {
              await characteristic.writeValue(chunk);
            }
          } catch (err) {
            appendLog(`Write chunk failed: ${err.message || err}`, { severity: 'error' });
            throw err;
          }
          // Slight delay to respect peripheral throughput limits
          await new Promise((resolve) => setTimeout(resolve, CHUNK_DELAY_MS));
        }
        offset = end;
      }
      appendLog(`TX: ${jsonString}`);
    },
    [appendLog],
  );

  const handleDeviceConfigChange = useCallback((field, value) => {
    setDeviceConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const submitDeviceConfig = useCallback(async () => {
    setErrorMessage('');
    setSavingDevice(true);
    try {
      if (!devicePayloadPreview.key_pair.publicKey) {
        throw new Error('Public key is required before sending configuration.');
      }
      if (devicePayloadBytes > MAX_JSON_SIZE) {
        throw new Error(`Payload is ${devicePayloadBytes} bytes, exceeding limit of ${MAX_JSON_SIZE}. Shorten values.`);
      }
      const payload = devicePayloadPreview;
      await sendJson(payload);
      appendLog('Sent device configuration');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send device configuration');
    } finally {
      setSavingDevice(false);
    }
  }, [appendLog, devicePayloadBytes, devicePayloadPreview, sendJson]);

  useEffect(() => {
    setSupported(Boolean(navigator.bluetooth));
  }, []);

  useEffect(
    () => () => {
      disconnect();
    },
    [disconnect],
  );

  const connectionIcon = useMemo(() => {
    switch (connectionStep) {
      case 'connected':
        return <BluetoothConnected color="success" sx={{ fontSize: 48 }} />;
      case 'connecting':
      case 'requesting':
        return <BluetoothSearching color="info" sx={{ fontSize: 48 }} />;
      case 'error':
        return <BluetoothDisabled color="error" sx={{ fontSize: 48 }} />;
      case 'disconnected':
        return <BluetoothDisabled color="warning" sx={{ fontSize: 48 }} />;
      default:
        return <Wifi color="primary" sx={{ fontSize: 48 }} />;
    }
  }, [connectionStep]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <GradientHeader
        icon={<Wifi sx={{ fontSize: 28 }} />}
        title="BLE Device Provisioning"
        subtitle="Connect to a CYBERFLY device and push configuration over Bluetooth Low Energy"
      />

      {!supported && (
        <Alert severity="error" sx={{ mb: 3 }}>
          This browser does not support the Web Bluetooth API. Please use a Chromium-based browser on desktop.
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 4, height: '100%' }}>
            <CardHeader
              title="Connection"
              avatar={connectionIcon}
              action={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Reconnect">
                    <span>
                      <IconButton onClick={connect} disabled={!supported || connectionStep === 'connecting'}>
                        <Refresh />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Disconnect">
                    <span>
                      <IconButton onClick={disconnect} disabled={connectionStep !== 'connected'}>
                        <BluetoothDisabled />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              }
            />
            <CardContent>
              <Typography 
                variant="subtitle1" 
                fontWeight={600} 
                sx={{ 
                  mb: 1,
                  color: statusBadge.includes('saved') || statusBadge.includes('complete') 
                    ? 'success.main' 
                    : statusBadge.includes('error') 
                    ? 'error.main'
                    : statusBadge.includes('ready') || statusBadge.includes('Connected')
                    ? 'primary.main'
                    : 'text.primary'
                }}
              >
                {statusBadge}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Service UUID: {SERVICE_UUID}
              </Typography>
              <Stack spacing={1} direction="row">
                <Button
                  variant="contained"
                  startIcon={<BluetoothSearching />}
                  onClick={connect}
                  disabled={!supported || connectionStep === 'connecting'}
                >
                  {connectionStep === 'connected' ? 'Reconnect' : 'Connect'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<BluetoothDisabled />}
                  onClick={disconnect}
                  disabled={connectionStep !== 'connected'}
                >
                  Disconnect
                </Button>
              </Stack>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" gutterBottom>
                Transfer constraints
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MAX_JSON_SIZE: {MAX_JSON_SIZE} bytes · Fragment timeout: {FRAGMENT_TIMEOUT_MS} ms · Chunk size: {DEFAULT_CHUNK_SIZE} bytes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 4, height: '100%' }}>
            <CardHeader title="Device configuration" subheader="Send WiFi and wallet credentials to the device" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Device ID"
                    fullWidth
                    value={deviceConfig.device_id}
                    onChange={(event) => handleDeviceConfigChange('device_id', event.target.value)}
                    helperText="Required · max 64 chars"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="WiFi SSID"
                    fullWidth
                    value={deviceConfig.ssid}
                    onChange={(event) => handleDeviceConfigChange('ssid', event.target.value)}
                    helperText="Required · max 32 chars"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="WiFi Password"
                    fullWidth
                    type="password"
                    value={deviceConfig.wifi_password}
                    onChange={(event) => handleDeviceConfigChange('wifi_password', event.target.value)}
                    helperText="Optional · max 64 chars"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Network ID"
                    fullWidth
                    value={deviceConfig.network_id}
                    onChange={(event) => handleDeviceConfigChange('network_id', event.target.value)}
                    helperText="Optional · max 32 chars"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Kadena key pair
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Public Key"
                    fullWidth
                    value={deviceConfig.publicKey}
                    onChange={(event) => handleDeviceConfigChange('publicKey', event.target.value)}
                    helperText="Required · max 128 chars"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Secret Key"
                    fullWidth
                    type="password"
                    value={deviceConfig.secretKey}
                    onChange={(event) => handleDeviceConfigChange('secretKey', event.target.value)}
                    helperText="Optional · stored securely on device"
                  />
                </Grid>
              </Grid>
              <Typography variant="caption" color={devicePayloadBytes > MAX_JSON_SIZE ? 'error.main' : 'text.secondary'}>
                Estimated payload: {devicePayloadBytes} / {MAX_JSON_SIZE} bytes
              </Typography>
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<AssignmentTurnedIn />}
                  disabled={connectionStep !== 'connected' || savingDevice}
                  onClick={submitDeviceConfig}
                >
                  {savingDevice ? 'Sending…' : 'Send device config'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 4 }}>
            <CardHeader title="Session log" subheader="Live stream of BLE events" />
            <CardContent>
              <Paper variant="outlined" sx={{ maxHeight: 280, overflowY: 'auto', p: 0 }}>
                <List dense>
                  {logs.length === 0 && (
                    <ListItem>
                      <ListItemText primary="Connect to a device to view logs." />
                    </ListItem>
                  )}
                  {logs.map((entry, idx) => (
                    <ListItem key={`${entry.ts.getTime()}-${idx}`} divider>
                      <ListItemText
                        primary={entry.message}
                        secondary={formatTimestamp(entry.ts)}
                        sx={{
                          color:
                            entry.meta?.severity === 'error'
                              ? 'error.main'
                              : entry.message.startsWith('TX:')
                              ? 'primary.main'
                              : entry.message.startsWith('RX:')
                              ? 'secondary.main'
                              : undefined,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BLEPage;

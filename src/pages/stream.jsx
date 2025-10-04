import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  LinearProgress,
  IconButton,
  Box,
} from '@mui/material';
import { PlayArrow, Stop, Videocam, ContentCopy } from '@mui/icons-material';
import { useDarkMode } from '../contexts/DarkModeContext';
import { startLibp2pNode } from '../services/libp2p-services';
import { useLibp2p } from '../contexts/Libp2pContext';
import { multiaddr } from '@multiformats/multiaddr';

// --- Utilities ---
const base64ToBuf = (b64) => {
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  } catch (e) {
    console.warn('base64ToBuf failed', e);
    return null;
  }
};

const bufToBase64 = (buf) => {
  try {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
  } catch (e) {
    console.warn('bufToBase64 failed', e);
    return null;
  }
};

// --- Constants ---
const STREAM_TOPIC_PREFIX = 'cyberfly.video.stream.';
const VIDEO_PROTOCOL = '/cyberfly/video/1.0.0';
const BOOTSTRAP_MULTIADDRS = [
  '/dns4/node.cyberfly.io/tcp/31002/wss/p2p/12D3KooWA8mwP9wGUc65abVDMuYccaAMAkXhKUqpwKUZSN5McDrw',
];

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

// --- Main Component ---
const StreamPage = () => {
  useDarkMode();
  const { libp2pState, setLibp2pState } = useLibp2p();
  const [channel, setChannel] = useState('main');
  const topicName = `${STREAM_TOPIC_PREFIX}${channel}`;
  const [broadcasting, setBroadcasting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [libp2pInitializing, setLibp2pInitializing] = useState(false);
  const [mimeType, setMimeType] = useState('');
  const [lastChunkTs, setLastChunkTs] = useState(null);
  const [peerCount, setPeerCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [lagMs, setLagMs] = useState(0);
  const [selfPeerId, setSelfPeerId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [manualPeerId, setManualPeerId] = useState('');
  const [manualConnectMsg, setManualConnectMsg] = useState('');
  const [connectionsSnapshot, setConnectionsSnapshot] = useState([]);
  const [debugLog, setDebugLog] = useState(true);
  const debugLogRef = useRef(true);
  useEffect(() => {
    debugLogRef.current = debugLog;
  }, [debugLog]);

  const debugLogFn = useCallback((...args) => {
    if (debugLogRef.current) console.log(...args);
  }, []);

  const [useWebRTC, setUseWebRTC] = useState(true);
  const [connectionType, setConnectionType] = useState('libp2p-protocol');
  const [remoteMuted, setRemoteMuted] = useState(true);

  // --- Refs ---
  const libp2pRef = useRef(libp2pState);
  const mediaRecorderRef = useRef(null);
  const initSegmentRef = useRef(null);
  const localStreamRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileUrlRef = useRef(null);
  const videoLocalRef = useRef(null);
  const videoRemoteRef = useRef(null);
  const videoRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const pendingBuffersRef = useRef([]);
  const earlyBuffersRef = useRef([]);
  const currentMimeTypeRef = useRef(null);
  const firstRemoteFrameRef = useRef(false);
  const framesReceivedRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());
  const chunkQueueRef = useRef([]);
  const isProcessingQueueRef = useRef(false);
  const lastSeqRef = useRef(-1);
  const consumersRef = useRef([]);
  const videoProtocolPeersRef = useRef(new Set());
  const peerConnectionsRef = useRef(new Map());
  const webrtcStreamRef = useRef(null);
  const messageHandlerRef = useRef(null);
  const broadcastMessageHandlerRef = useRef(null);
  const protocolHandlerActiveRef = useRef(false);

  // Intervals/Timeouts
  const reinitIntervalRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const streamHealthIntervalRef = useRef(null);
  const initRetryIntervalRef = useRef(null);
  const mediaSourceResetTimeoutRef = useRef(null);
  const statIntervalRef = useRef(null);
  const connIntervalRef = useRef(null);

  // Recovery state
  const recoveryStateRef = useRef({
    isRequestingInit: false,
    isRestartingICE: false,
    isReconnecting: false,
  });

  const [streamHealth, setStreamHealth] = useState({
    framesReceived: 0,
    lastFrameTime: 0,
    isStalled: false,
    bufferHealth: 'unknown',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [sourceMode, setSourceMode] = useState('camera');
  const [webrtcConnections, setWebrtcConnections] = useState([]);

  // --- Helpers ---
  const showMsg = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeMsg = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const ensureLibp2p = useCallback(async () => {
    if (libp2pState) return libp2pState;
    setLibp2pInitializing(true);
    try {
      const lp = await startLibp2pNode();
      if (lp) {
        setLibp2pState(lp);
        showMsg('Libp2p connected successfully', 'success');
        return lp;
      }
    } catch (e) {
      console.error('[STREAM] Failed to initialize libp2p:', e);
      showMsg('Failed to connect to libp2p network', 'error');
    } finally {
      setLibp2pInitializing(false);
    }
    return null;
  }, [libp2pState, setLibp2pState]);

  const resetRecoveryState = useCallback(() => {
    recoveryStateRef.current = {
      isRequestingInit: false,
      isRestartingICE: false,
      isReconnecting: false,
    };
  }, []);

  const requestInit = useCallback(
    (reason = 'manual', lpInstance = null) => {
      const lp = lpInstance || libp2pState;
      if (!lp) {
        console.warn('[STREAM][REQUEST INIT] No libp2p instance');
        return;
      }
      const msg = { type: 'request-init', ts: Date.now(), from: lp.peerId.toString(), reason };
      debugLogFn('[STREAM][REQUEST INIT]', reason, 'to', topicName);
      lp.services.pubsub.publish(topicName, new TextEncoder().encode(JSON.stringify(msg))).catch(console.error);
    },
    [debugLogFn, libp2pState, topicName]
  );

  // --- WebRTC ---
  const createPeerConnection = async (peerId) => {
    try {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage(peerId, { type: 'ice-candidate', candidate: event.candidate });
        }
      };
      pc.onconnectionstatechange = () => {
        console.log(`[WEBRTC] Connection state for ${peerId}: ${pc.connectionState}`);
      };
      peerConnectionsRef.current.set(peerId, pc);
      return pc;
    } catch (e) {
      console.error('[WEBRTC] Failed to create peer connection', e);
      return null;
    }
  };

  const sendSignalingMessage = (peerId, message) => {
    const lp = libp2pState;
    if (!lp) return;
    const signalingMsg = {
      type: 'webrtc-signaling',
      from: lp.peerId.toString(),
      to: peerId,
      message,
      ts: Date.now(),
    };
    lp.services.pubsub.publish(topicName, new TextEncoder().encode(JSON.stringify(signalingMsg))).catch(() => {});
  };

  const handleSignalingMessage = async (parsed) => {
    if (parsed.type !== 'webrtc-signaling' || parsed.to !== libp2pState?.peerId?.toString()) return;

    const peerId = parsed.from;
    let pc = peerConnectionsRef.current.get(peerId);
    if (!pc) {
      pc = await createPeerConnection(peerId);
      if (!pc) return;
    }

    const signalingMsg = parsed.message;
    try {
      if (signalingMsg.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signalingMsg));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignalingMessage(peerId, { type: 'answer', sdp: answer.sdp });
      } else if (signalingMsg.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signalingMsg));
      } else if (signalingMsg.type === 'ice-candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(signalingMsg.candidate));
      }
    } catch (e) {
      console.error('[WEBRTC] Signaling error', e);
    }
  };

  const initiateWebRTCConnection = async (targetPeerId) => {
    try {
      const pc = await createPeerConnection(targetPeerId);
      if (!pc || !webrtcStreamRef.current) return;

      webrtcStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, webrtcStreamRef.current));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignalingMessage(targetPeerId, { type: 'offer', sdp: offer.sdp });
      setWebrtcConnections((prev) => [...prev, targetPeerId]);
    } catch (e) {
      console.error('[WEBRTC] Initiate connection failed', e);
    }
  };

  // --- MediaSource Pipeline ---
  const resetMediaSourcePipeline = useCallback(() => {
    try {
      if (mediaSourceResetTimeoutRef.current) clearTimeout(mediaSourceResetTimeoutRef.current);
      if (pendingBuffersRef.current.length > 0) {
        earlyBuffersRef.current.push(...pendingBuffersRef.current);
        pendingBuffersRef.current = [];
      }

      if (sourceBufferRef.current) sourceBufferRef.current = null;
      if (mediaSourceRef.current) {
        if (mediaSourceRef.current.readyState === 'open') {
          // Do not call endOfStream to avoid premature close
        }
        mediaSourceRef.current = null;
      }

      if (videoRemoteRef.current) {
        URL.revokeObjectURL(videoRemoteRef.current.src);
        videoRemoteRef.current.src = '';
      }

      firstRemoteFrameRef.current = false;

      if (mimeType) {
        setTimeout(() => {
          if (!('MediaSource' in window)) {
            showMsg('MediaSource API not supported', 'error');
            return;
          }
          const ms = new MediaSource();
          mediaSourceRef.current = ms;
          videoRemoteRef.current.src = URL.createObjectURL(ms);

          ms.addEventListener('sourceopen', () => {
            if (ms !== mediaSourceRef.current || ms.readyState !== 'open') return;
            try {
              const sb = ms.addSourceBuffer(mimeType);
              sourceBufferRef.current = sb;
              sb.mode = 'sequence';

              sb.addEventListener('updateend', handleUpdateEnd);

              // Process early buffers
              while (earlyBuffersRef.current.length) {
                const buf = earlyBuffersRef.current.shift();
                if (!sb.updating && ms.readyState === 'open') {
                  sb.appendBuffer(buf);
                } else {
                  pendingBuffersRef.current.push(buf);
                }
              }
            } catch (err) {
              console.error('[STREAM][RESET] SourceBuffer setup failed', err);
            }
          });
        }, 100);
      }
    } catch (e) {
      console.error('[STREAM][RESET] Error', e);
    }
  }, [mimeType]);

  const handleUpdateEnd = useCallback(() => {
    const sb = sourceBufferRef.current;
    const ms = mediaSourceRef.current;
    if (!sb || !ms || ms.readyState !== 'open' || !Array.from(ms.sourceBuffers).includes(sb)) return;

    console.log('[STREAM][UPDATEEND] SourceBuffer ready, pending:', pendingBuffersRef.current.length, 'updating:', sb.updating);

    if (pendingBuffersRef.current.length > 0 && !sb.updating) {
      const next = pendingBuffersRef.current.shift();
      if (next) {
        try {
          sb.appendBuffer(next);
          console.log('[STREAM][UPDATEEND] ✓ Appended pending buffer');
        } catch (e) {
          console.error('[STREAM][UPDATEEND] ✗ Append failed', e);
          if (e.name === 'InvalidStateError' && e.message.includes('removed')) {
            resetMediaSourcePipeline();
          }
        }
      }
    }

    if (!firstRemoteFrameRef.current && videoRemoteRef.current && videoRemoteRef.current.readyState >= 2) {
      firstRemoteFrameRef.current = true;
      videoRemoteRef.current.play().catch(console.error);
    }
  }, [resetMediaSourcePipeline]);

  const appendChunk = useCallback(
    (newChunk) => {
      if (newChunk) {
        chunkQueueRef.current.push(newChunk);
        
        // Prevent queue overflow
        if (chunkQueueRef.current.length > 100) {
          console.warn('[STREAM][BUFFER] Queue overflow, dropping oldest chunks');
          chunkQueueRef.current = chunkQueueRef.current.slice(-50); // Keep last 50
        }
        
        // Log queue status periodically
        if (chunkQueueRef.current.length % 20 === 0 && chunkQueueRef.current.length > 0) {
          console.log('[STREAM][BUFFER] Queue depth:', chunkQueueRef.current.length);
        }
      }
      
      if (isProcessingQueueRef.current || chunkQueueRef.current.length === 0) return;

      isProcessingQueueRef.current = true;
      const chunk = chunkQueueRef.current.shift();
      
      const sbReady = () => {
        const ms = mediaSourceRef.current;
        const sb = sourceBufferRef.current;
        return ms && sb && ms.readyState === 'open' && Array.from(ms.sourceBuffers).includes(sb) && !sb.updating;
      };

      if (!sbReady()) {
        const sb = sourceBufferRef.current;
        const ms = mediaSourceRef.current;
        
        // Log why not ready
        if (!ms) {
          console.warn('[STREAM][BUFFER] ⚠ MediaSource not available');
        } else if (!sb) {
          console.warn('[STREAM][BUFFER] ⚠ SourceBuffer not available');
        } else if (ms.readyState !== 'open') {
          console.warn('[STREAM][BUFFER] ⚠ MediaSource state:', ms.readyState);
        } else if (sb.updating) {
          console.warn('[STREAM][BUFFER] ⚠ SourceBuffer stuck updating');
        }
        
        earlyBuffersRef.current.push(chunk);
        lastFrameTimeRef.current = Date.now();
        isProcessingQueueRef.current = false;
        
        // Retry with backoff
        setTimeout(() => appendChunk(), 120);
        return;
      }

      try {
        sourceBufferRef.current.appendBuffer(chunk);
        lastFrameTimeRef.current = Date.now();
        resetRecoveryState();
        framesReceivedRef.current += 1;

        setStreamHealth((prev) => {
          const buffer = sourceBufferRef.current;
          let bufferLength = 0;
          let bufferHealth = 'unknown';
          
          try {
            if (buffer?.buffered.length > 0) {
              bufferLength = buffer.buffered.end(0) - buffer.buffered.start(0);
              bufferHealth = bufferLength > 2 ? 'healthy' : bufferLength > 0.5 ? 'low' : 'critical';
            }
          } catch (e) {
            console.warn('[STREAM][BUFFER] Error reading buffer state', e);
          }
          
          return {
            ...prev,
            framesReceived: prev.framesReceived + 1,
            lastFrameTime: Date.now(),
            isStalled: false,
            bufferHealth,
          };
        });

        // Auto-play when ready
        if (videoRemoteRef.current && videoRemoteRef.current.paused && videoRemoteRef.current.readyState >= 2) {
          videoRemoteRef.current.play().catch((err) => {
            console.warn('[STREAM][VIDEO] Auto-play failed:', err.message);
          });
        }
      } catch (e) {
        console.error('[STREAM][APPEND] ✗ Error appending buffer:', e.name, e.message);
        
        if (e.name === 'InvalidStateError' && e.message.includes('removed')) {
          console.log('[STREAM][APPEND] ⚠ SourceBuffer removed, resetting pipeline');
          resetMediaSourcePipeline();
          return;
        }
        
        if (e.name === 'QuotaExceededError') {
          console.warn('[STREAM][APPEND] ⚠ Quota exceeded, attempting buffer cleanup');
          try {
            const buffer = sourceBufferRef.current;
            if (buffer && buffer.buffered.length > 0) {
              const end = buffer.buffered.end(buffer.buffered.length - 1);
              if (end > 30) {
                buffer.remove(0, end - 20); // Keep last 20 seconds
                console.log('[STREAM][APPEND] ✓ Removed old buffer data');
              }
            }
          } catch (removeErr) {
            console.error('[STREAM][APPEND] ✗ Buffer cleanup failed:', removeErr);
          }
        }
        
        // Re-queue chunk for retry
        pendingBuffersRef.current.unshift(chunk);
        setTimeout(() => {
          const sb = sourceBufferRef.current;
          const ms = mediaSourceRef.current;
          if (sb && ms && ms.readyState === 'open' && !sb.updating && pendingBuffersRef.current.length > 0) {
            const next = pendingBuffersRef.current.shift();
            if (next) sb.appendBuffer(next);
          }
        }, 400);
      } finally {
        isProcessingQueueRef.current = false;
        if (chunkQueueRef.current.length > 0) setTimeout(() => appendChunk(), 0);
      }
    },
    [resetMediaSourcePipeline, resetRecoveryState]
  );

  const setupMediaSource = useCallback(
    (mt) => {
      if (currentMimeTypeRef.current === mt && mediaSourceRef.current && sourceBufferRef.current) return;

      if (!('MediaSource' in window)) {
        showMsg('MediaSource API not supported', 'error');
        return;
      }

      if (videoRemoteRef.current?.src) URL.revokeObjectURL(videoRemoteRef.current.src);

      const ms = new MediaSource();
      mediaSourceRef.current = ms;
      currentMimeTypeRef.current = mt;
      videoRemoteRef.current.src = URL.createObjectURL(ms);

      ms.addEventListener('sourceopen', () => {
        if (ms !== mediaSourceRef.current || ms.readyState !== 'open') return;
        try {
          const sb = ms.addSourceBuffer(mt);
          sourceBufferRef.current = sb;
          sb.mode = 'sequence';
          sb.addEventListener('updateend', handleUpdateEnd);

          while (earlyBuffersRef.current.length) {
            const buf = earlyBuffersRef.current.shift();
            if (!sb.updating && ms.readyState === 'open') {
              sb.appendBuffer(buf);
            } else {
              pendingBuffersRef.current.push(buf);
            }
          }
        } catch (err) {
          console.error('SourceBuffer setup error', err);
          showMsg('Failed to init SourceBuffer', 'error');
        }
      });

      // Fallback watchdog
      setTimeout(() => {
        if (!sourceBufferRef.current && mediaSourceRef.current === ms) {
          const fallbacks = ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8', 'video/webm'];
          const next = fallbacks.find((f) => f !== mt && MediaSource.isTypeSupported(f));
          if (next) {
            setupMediaSource(next);
            requestInit('watchdog-fallback');
          }
        }
      }, 1000);
    },
    [handleUpdateEnd, requestInit]
  );

  // --- Broadcast ---
  const startBroadcast = async () => {
    if (broadcasting) return showMsg('Broadcast already in progress', 'info');
    const lp = await ensureLibp2p();
    if (!lp) return;

    try {
      // Bootstrap connection
      const bootstrapAddr = BOOTSTRAP_MULTIADDRS[0];
      if (bootstrapAddr) {
        const bootstrapPeerId = bootstrapAddr.split('/p2p/')[1];
        const connectedIds = lp.getConnections().map((c) => c.remotePeer.toString());
        if (!connectedIds.includes(bootstrapPeerId)) {
          await lp.dial(multiaddr(bootstrapAddr));
        }
      }

      if (!selfPeerId) setSelfPeerId(lp.peerId.toString());

      // Get media stream
      let mediaStream = null;
      if (sourceMode === 'camera') {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 640, height: 360 } });
        if (videoLocalRef.current) videoLocalRef.current.srcObject = mediaStream;
      } else if (sourceMode === 'file' || sourceMode === 'file-audio') {
        if (!selectedFile || !fileUrlRef.current || !videoLocalRef.current) {
          return showMsg('Select a file first', 'error');
        }
        const v = videoLocalRef.current;
        const videoStream = v.captureStream?.();
        if (!videoStream) throw new Error('captureStream not supported');
        if (sourceMode === 'file') {
          mediaStream = videoStream;
        } else {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          const combined = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
          mediaStream = combined;
        }
      }

      if (!mediaStream) return;

      localStreamRef.current = mediaStream;
      webrtcStreamRef.current = mediaStream;

      const preferred = ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8', 'video/webm'];
      const selected = preferred.find((m) => MediaRecorder.isTypeSupported(m)) || '';
      const mr = new MediaRecorder(mediaStream, selected ? { mimeType: selected } : {});
      setMimeType(selected || mr.mimeType);
      mediaRecorderRef.current = mr;
      lastSeqRef.current = -1;

      // Self-subscribe
      if (!lp.services.pubsub.getTopics().includes(topicName)) {
        await lp.services.pubsub.subscribe(topicName);
      }

      // Publish init
      const initPayload = { type: 'init', mimeType: selected || mr.mimeType, ts: Date.now(), from: lp.peerId.toString() };
      await lp.services.pubsub.publish(topicName, new TextEncoder().encode(JSON.stringify(initPayload)));

      setParticipants((prev) => (prev.includes(lp.peerId.toString()) ? prev : [...prev, lp.peerId.toString()]));

      // Handle request-init
      const onMessage = (evt) => {
        const msgObj = evt.detail;
        if (!msgObj || msgObj.topic !== topicName) return;
        try {
          const txt = new TextDecoder().decode(msgObj.data);
          const parsed = JSON.parse(txt);
          if (parsed.type === 'request-init' && initSegmentRef.current) {
            const b64 = bufToBase64(initSegmentRef.current);
            const payload = { ...initPayload, ts: Date.now(), replay: true, b64 };
            lp.services.pubsub.publish(topicName, new TextEncoder().encode(JSON.stringify(payload))).catch(() => {});
          }
        } catch (e) {
          console.warn('request-init handler error', e);
        }
      };

      if (broadcastMessageHandlerRef.current) {
        lp.services.pubsub.removeEventListener('message', broadcastMessageHandlerRef.current);
      }
      lp.services.pubsub.addEventListener('message', onMessage);
      broadcastMessageHandlerRef.current = onMessage;

      // MediaRecorder
      mr.ondataavailable = async (e) => {
        if (!e.data || e.data.size === 0) {
          console.warn('[STREAM][BROADCAST] ⚠ Empty data chunk received');
          return;
        }
        
        const arrayBuf = await e.data.arrayBuffer();
        const frame = new Uint8Array(arrayBuf);
        const nextSeq = lastSeqRef.current + 1;
        lastSeqRef.current = nextSeq;
        
        // Log periodically to confirm frames are being generated
        if (nextSeq % 10 === 0) {
          console.log('[STREAM][BROADCAST] 📹 MediaRecorder frame:', nextSeq, 'size:', frame.length, 'state:', mr.state);
        }

        if (nextSeq === 0 && !initSegmentRef.current) {
          initSegmentRef.current = frame.slice();
          const b64 = bufToBase64(initSegmentRef.current);
          const enriched = { ...initPayload, ts: Date.now(), replay: true, b64, firstSegment: true };
          lp.services.pubsub.publish(topicName, new TextEncoder().encode(JSON.stringify(enriched))).catch(() => {});
          console.log('[STREAM][BROADCAST] ✓ Init segment captured:', frame.length, 'bytes');
        }

        // Send via protocol streams to connected viewers
        let protocolSent = false;
        const activeConsumers = consumersRef.current.length;
        
        if (activeConsumers > 0) {
          for (const consumer of consumersRef.current) {
            try {
              const lenBuf = new Uint8Array(4);
              new DataView(lenBuf.buffer).setUint32(0, frame.length, false);
              consumer.push(lenBuf);
              consumer.push(frame);
              protocolSent = true;
            } catch (err) {
              console.warn('[STREAM][BROADCAST] ⚠ Protocol send failed to', consumer.id, err.message);
            }
          }
          
          if (nextSeq % 50 === 0) { // Log every 50 frames
            console.log('[STREAM][BROADCAST] ✓ Protocol delivery - seq:', nextSeq, 'to', activeConsumers, 'viewers');
          }
        }

        // Fallback to pubsub if no protocol consumers
        if (!protocolSent) {
          const b64 = bufToBase64(frame);
          const chunkMsg = { type: 'chunk', seq: nextSeq, b64, ts: Date.now(), from: lp.peerId.toString() };
          lp.services.pubsub.publish(topicName, new TextEncoder().encode(JSON.stringify(chunkMsg))).catch(() => {});
          
          if (nextSeq % 50 === 0 && nextSeq > 0) { // Log every 50 frames
            console.log('[STREAM][BROADCAST] ⚠ Pubsub fallback - seq:', nextSeq, '(no protocol consumers)');
          }
        }

        setLastChunkTs(new Date());
      };
      
      mr.onerror = (event) => {
        console.error('[STREAM][BROADCAST] ✗ MediaRecorder error:', event.error);
        showMsg('MediaRecorder error: ' + event.error?.message, 'error');
      };
      
      mr.onstart = () => {
        console.log('[STREAM][BROADCAST] ✓ MediaRecorder started, timeslice: 800ms');
      };
      
      mr.onstop = () => {
        console.log('[STREAM][BROADCAST] ✗ MediaRecorder stopped');
      };

      mr.start(800);
      console.log('[STREAM][BROADCAST] 📹 MediaRecorder starting with state:', mr.state);

      // Periodic init
      reinitIntervalRef.current = setInterval(() => {
        let rein = { ...initPayload, ts: Date.now(), periodic: true };
        if (initSegmentRef.current) {
          const b64 = bufToBase64(initSegmentRef.current);
          rein = { ...rein, b64 };
        }
        lp.services.pubsub.publish(topicName, new TextEncoder().encode(JSON.stringify(rein))).catch(console.warn);
      }, 15000);

      heartbeatIntervalRef.current = setInterval(() => {
        const hb = { type: 'hb', ts: Date.now(), from: lp.peerId.toString() };
        lp.services.pubsub.publish(topicName, new TextEncoder().encode(JSON.stringify(hb))).catch(() => {});
        
        // Check MediaRecorder health
        if (mediaRecorderRef.current) {
          const mr = mediaRecorderRef.current;
          const timeSinceLastChunk = lastChunkTs ? Date.now() - lastChunkTs.getTime() : 0;
          
          if (mr.state === 'recording' && timeSinceLastChunk > 5000) {
            console.warn('[STREAM][BROADCAST] ⚠ MediaRecorder stalled - no chunks for', Math.floor(timeSinceLastChunk / 1000), 's');
            console.log('[STREAM][BROADCAST] ℹ MediaRecorder state:', mr.state, 'mimeType:', mr.mimeType);
          }
          
          if (mr.state !== 'recording') {
            console.error('[STREAM][BROADCAST] ✗ MediaRecorder not recording! State:', mr.state);
          }
        }
      }, 5000);

      // Protocol handler
      await lp.handle(VIDEO_PROTOCOL, async ({ stream, connection }) => {
        const viewerId = connection.remotePeer.toString();
        console.log('[STREAM][PROTO] ✓ Viewer connected:', viewerId);
        
        class AsyncQueue {
          items = [];
          resolvers = [];
          ended = false;
          
          push(item) {
            if (this.ended) return;
            if (this.resolvers.length) {
              this.resolvers.shift()({ value: item, done: false });
            } else {
              this.items.push(item);
            }
          }
          
          close() {
            this.ended = true;
            while (this.resolvers.length) this.resolvers.shift()({ done: true });
          }
          
          [Symbol.asyncIterator]() {
            return {
              next: () => {
                if (this.items.length) return Promise.resolve({ value: this.items.shift(), done: false });
                if (this.ended) return Promise.resolve({ done: true });
                return new Promise((res) => this.resolvers.push(res));
              },
            };
          }
        }

        const q = new AsyncQueue();
        const consumerObj = {
          id: viewerId,
          push: (c) => {
            try {
              q.push(c);
            } catch (err) {
              console.warn('[STREAM][PROTO] Push error to', viewerId, err);
            }
          },
          end: () => q.close(),
          connection: connection,
        };
        
        consumersRef.current.push(consumerObj);
        console.log('[STREAM][PROTO] Active consumers:', consumersRef.current.length);

        // Send init segment immediately if available
        if (initSegmentRef.current) {
          try {
            const lenBuf = new Uint8Array(4);
            new DataView(lenBuf.buffer).setUint32(0, initSegmentRef.current.length, false);
            consumerObj.push(lenBuf);
            consumerObj.push(initSegmentRef.current);
            console.log('[STREAM][PROTO] ✓ Init segment sent to', viewerId, initSegmentRef.current.length, 'bytes');
          } catch (err) {
            console.error('[STREAM][PROTO] ✗ Failed to send init segment to', viewerId, err);
          }
        } else {
          console.warn('[STREAM][PROTO] ⚠ No init segment available for', viewerId);
        }

        // Start writing to stream
        const writerPromise = stream.sink(q[Symbol.asyncIterator]()).catch((err) => {
          console.error('[STREAM][PROTO] ✗ Stream sink error for', viewerId, err);
        });

        // Drain inbound (viewers don't send data, but we need to consume)
        (async () => {
          try {
            for await (const _ of stream.source) {
              /* ignore inbound data */
            }
          } catch (err) {
            console.log('[STREAM][PROTO] Source ended for', viewerId);
          }
        })();

        // Cleanup on disconnect
        writerPromise.finally(() => {
          console.log('[STREAM][PROTO] ✗ Viewer disconnected:', viewerId);
          consumersRef.current = consumersRef.current.filter((c) => c.id !== viewerId);
          consumerObj.end();
          console.log('[STREAM][PROTO] Active consumers:', consumersRef.current.length);
        });
      });
      protocolHandlerActiveRef.current = true;
      console.log('[STREAM][PROTO] ✓ Protocol handler registered:', VIDEO_PROTOCOL);

      setBroadcasting(true);
      showMsg('Broadcast started', 'success');
    } catch (err) {
      console.error(err);
      showMsg('Cannot start broadcast', 'error');
    }
  };

  const stopBroadcast = async () => {
    const lp = libp2pState || libp2pRef.current;
    if (lp && broadcastMessageHandlerRef.current) {
      lp.services.pubsub.removeEventListener('message', broadcastMessageHandlerRef.current);
    }
    if (lp && protocolHandlerActiveRef.current) {
      await lp.unhandle(VIDEO_PROTOCOL).catch(console.warn);
    }
    protocolHandlerActiveRef.current = false;
    broadcastMessageHandlerRef.current = null;

    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    mediaRecorderRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    consumersRef.current.forEach((c) => c.end?.());
    consumersRef.current = [];

    if (fileUrlRef.current) {
      URL.revokeObjectURL(fileUrlRef.current);
      fileUrlRef.current = null;
      setSelectedFile(null);
      if (videoLocalRef.current) videoLocalRef.current.src = '';
    }

    // Close WebRTC
    peerConnectionsRef.current.forEach((pc, peerId) => {
      pc.close();
      setWebrtcConnections((prev) => prev.filter((id) => id !== peerId));
    });
    peerConnectionsRef.current.clear();

    if (reinitIntervalRef.current) clearInterval(reinitIntervalRef.current);
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    initSegmentRef.current = null;
    setBroadcasting(false);
    showMsg('Broadcast stopped', 'info');
  };

  // --- Subscribe ---
  const subscribe = useCallback(async () => {
    if (subscribed) return showMsg('Already subscribed', 'info');
    let lp = libp2pState || (await ensureLibp2p());
    if (!lp) return showMsg('Libp2p not ready', 'error');

    // Reset state
    setStreamHealth({ framesReceived: 0, isStalled: false, bufferHealth: 'Subscribing...', lastFrameTime: 0 });
    lastFrameTimeRef.current = Date.now();
    chunkQueueRef.current = [];
    isProcessingQueueRef.current = false;
    firstRemoteFrameRef.current = false;
    framesReceivedRef.current = 0;
    resetRecoveryState();

    const messageHandler = (msg) => {
      try {
        const raw = msg.detail || msg;
        if (raw.topic !== topicName) return;
        const dataBytes = raw.data?.data || raw.data;
        if (!dataBytes || !(dataBytes instanceof Uint8Array)) return;

        const dataStr = new TextDecoder().decode(dataBytes);
        const parsedMsg = JSON.parse(dataStr);
        if (!parsedMsg?.type) return;

        // Handle WebRTC signaling
        if (parsedMsg.type === 'webrtc-signaling') {
          handleSignalingMessage(parsedMsg);
          return;
        }

        if (parsedMsg.type === 'init') {
          if (currentMimeTypeRef.current !== parsedMsg.mimeType) {
            setMimeType(parsedMsg.mimeType);
            setupMediaSource(parsedMsg.mimeType);
          }

          // Dial protocol with retry
          if (parsedMsg.from && !videoProtocolPeersRef.current.has(parsedMsg.from)) {
            const broadcasterId = parsedMsg.from;
            videoProtocolPeersRef.current.add(broadcasterId);
            
            console.log('[STREAM][VIEWER] \u2192 Attempting protocol dial to broadcaster:', broadcasterId);
            
            lp
              .dialProtocol(broadcasterId, VIDEO_PROTOCOL)
              .then(({ stream }) => {
                console.log('[STREAM][VIEWER] \u2713 Protocol connection established to:', broadcasterId);
                
                (async () => {
                  let buf = new Uint8Array(0);
                  let frameCount = 0;
                  
                  try {
                    for await (const chunk of stream.source) {
                      if (!(chunk instanceof Uint8Array)) {
                        console.warn('[STREAM][VIEWER] ⚠ Received non-Uint8Array chunk');
                        continue;
                      }
                      
                      // Merge with buffer
                      const merged = new Uint8Array(buf.length + chunk.length);
                      merged.set(buf);
                      merged.set(chunk, buf.length);
                      buf = merged;
                      
                      // Process complete frames
                      while (buf.length >= 4) {
                        const frameLen = new DataView(buf.buffer, buf.byteOffset).getUint32(0, false);
                        
                        // Validate frame length
                        if (frameLen > 10 * 1024 * 1024) { // 10MB max per frame
                          console.error('[STREAM][VIEWER] \u2717 Frame too large:', frameLen, 'bytes - discarding buffer');
                          buf = new Uint8Array(0);
                          break;
                        }
                        
                        if (buf.length < 4 + frameLen) break; // Need more data
                        
                        const frame = buf.slice(4, 4 + frameLen);
                        buf = buf.slice(4 + frameLen);
                        
                        appendChunk(frame.buffer);
                        frameCount++;
                        
                        if (frameCount === 1) {
                          console.log('[STREAM][VIEWER] \u2713 First frame received via protocol from:', broadcasterId);
                        }
                      }
                    }
                    console.log('[STREAM][VIEWER] \u2717 Protocol stream ended from:', broadcasterId, '- received', frameCount, 'frames');
                  } catch (err) {
                    console.error('[STREAM][VIEWER] \u2717 Protocol stream error from:', broadcasterId, err);
                  } finally {
                    videoProtocolPeersRef.current.delete(broadcasterId);
                    console.log('[STREAM][VIEWER] \u26a0 Removed from protocol peers:', broadcasterId);
                  }
                })();
              })
              .catch((err) => {
                console.error('[STREAM][VIEWER] \u2717 Protocol dial failed to:', broadcasterId, err.message || err);
                videoProtocolPeersRef.current.delete(broadcasterId);
                console.log('[STREAM][VIEWER] \u26a0 Falling back to pubsub for:', broadcasterId);
                
                // Retry after delay
                setTimeout(() => {
                  if (videoProtocolPeersRef.current.has(broadcasterId)) return; // Already retrying
                  console.log('[STREAM][VIEWER] \u27f3 Retrying protocol dial to:', broadcasterId);
                  videoProtocolPeersRef.current.delete(broadcasterId); // Allow retry
                }, 3000);
              });
          }

          // Handle init segment
          if (parsedMsg.b64) {
            const ab = base64ToBuf(parsedMsg.b64);
            if (ab) appendChunk(ab);
          }

          setParticipants((prev) => (prev.includes(parsedMsg.from) ? prev : [...prev, parsedMsg.from]));
        } else if (parsedMsg.type === 'chunk') {
          setLagMs(Date.now() - parsedMsg.ts);
          if (parsedMsg.seq <= lastSeqRef.current) return;
          lastSeqRef.current = parsedMsg.seq;
          const ab = base64ToBuf(parsedMsg.b64);
          if (ab) appendChunk(ab);
          setParticipants((prev) => (prev.includes(parsedMsg.from) ? prev : [...prev, parsedMsg.from]));
        }
      } catch (e) {
        console.error('[STREAM][HANDLER ERROR]', e);
      }
    };

    messageHandlerRef.current = messageHandler;

    // Subscribe
    try {
      if (lp.services.pubsub.subscribe.length >= 2) {
        await lp.services.pubsub.subscribe(topicName, messageHandler);
      } else {
        await lp.services.pubsub.subscribe(topicName);
        lp.services.pubsub.addEventListener('message', messageHandler);
      }
    } catch (e) {
      console.error('Subscribe failed', e);
      return;
    }

    setSubscribed(true);
    requestInit('initial-subscribe', lp);

    // Health monitor
    streamHealthIntervalRef.current = setInterval(() => {
      const isStalled = Date.now() - lastFrameTimeRef.current > 3000;
      setStreamHealth((prev) => ({ ...prev, isStalled }));
      if (!isStalled) return resetRecoveryState();

      const stallDuration = Date.now() - lastFrameTimeRef.current;
      if (stallDuration > 12000 && !recoveryStateRef.current.isReconnecting) {
        recoveryStateRef.current.isReconnecting = true;
        unsubscribe().then(() => setTimeout(subscribe, 500));
      } else if (stallDuration > 8000 && !recoveryStateRef.current.isRestartingICE) {
        recoveryStateRef.current.isRestartingICE = true;
        requestInit('ice-restart-recovery', lp);
      } else if (stallDuration > 5000 && !recoveryStateRef.current.isRequestingInit) {
        recoveryStateRef.current.isRequestingInit = true;
        requestInit('stall-recovery', lp);
      }
    }, 2000);
  }, [appendChunk, ensureLibp2p, libp2pState, setupMediaSource, topicName]);

  const unsubscribe = useCallback(async () => {
    if (!libp2pState || !subscribed) return;
    const lp = libp2pState;
    const handler = messageHandlerRef.current;

    try {
      if (lp.services.pubsub.unsubscribe.length >= 2 && handler) {
        await lp.services.pubsub.unsubscribe(topicName, handler);
      } else {
        await lp.services.pubsub.unsubscribe(topicName);
        if (handler) lp.services.pubsub.removeEventListener('message', handler);
      }
    } catch (e) {
      console.warn('Unsubscribe error', e);
    }

    messageHandlerRef.current = null;
    videoProtocolPeersRef.current.clear();
    framesReceivedRef.current = 0;

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setWebrtcConnections([]);

    if (streamHealthIntervalRef.current) clearInterval(streamHealthIntervalRef.current);
    setStreamHealth({ framesReceived: 0, isStalled: false, bufferHealth: 'unknown', lastFrameTime: 0 });
    resetMediaSourcePipeline();
    lastSeqRef.current = -1;
    setSubscribed(false);
    showMsg('Unsubscribed', 'info');
  }, [libp2pState, resetMediaSourcePipeline, subscribed, topicName]);

  // --- Effects ---
  useEffect(() => {
    libp2pRef.current = libp2pState;
  }, [libp2pState]);

  useEffect(() => {
    if (!libp2pState) return;
    const updatePeers = () => setPeerCount(libp2pState.getPeers().length);
    updatePeers();
    statIntervalRef.current = setInterval(updatePeers, 5000);
    connIntervalRef.current = setInterval(() => {
      try {
        setConnectionsSnapshot(
          libp2pState.getConnections().map((c) => ({
            id: c.remotePeer.toString(),
            streams: c.streams.length,
            status: c.status,
          }))
        );
      } catch {}
    }, 4000);
    return () => {
      if (statIntervalRef.current) clearInterval(statIntervalRef.current);
      if (connIntervalRef.current) clearInterval(connIntervalRef.current);
    };
  }, [libp2pState]);

  useEffect(() => {
    if (!libp2pState && !libp2pInitializing) {
      ensureLibp2p();
    }
  }, [libp2pState, libp2pInitializing, ensureLibp2p]);

  useEffect(() => {
    return () => {
      stopBroadcast();
      unsubscribe();
      if (reinitIntervalRef.current) clearInterval(reinitIntervalRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (streamHealthIntervalRef.current) clearInterval(streamHealthIntervalRef.current);
      if (initRetryIntervalRef.current) clearInterval(initRetryIntervalRef.current);
      if (statIntervalRef.current) clearInterval(statIntervalRef.current);
      if (connIntervalRef.current) clearInterval(connIntervalRef.current);
      if (mediaSourceResetTimeoutRef.current) clearTimeout(mediaSourceResetTimeoutRef.current);
    };
  }, []);

  // --- Manual Connect ---
  const connectToManualPeer = async () => {
    const target = manualPeerId.trim();
    if (!target) return setManualConnectMsg('Enter peer id');
    const lp = await ensureLibp2p();
    if (!lp) return setManualConnectMsg('Libp2p not ready');

    // Ensure bootstrap
    try {
      const bootstrapAddr = BOOTSTRAP_MULTIADDRS[0];
      if (bootstrapAddr) {
        const relayPeerId = bootstrapAddr.split('/p2p/')[1];
        const connectedIds = lp.getConnections().map((c) => c.remotePeer.toString());
        if (!connectedIds.includes(relayPeerId)) {
          await lp.dial(multiaddr(bootstrapAddr));
        }
      }
    } catch (e) {
      console.warn('Bootstrap dial failed', e);
    }

    if (useWebRTC && connectionType === 'webrtc') {
      try {
        setManualConnectMsg('Attempting WebRTC...');
        await initiateWebRTCConnection(target);
        setManualConnectMsg('WebRTC initiated');
        return;
      } catch (e) {
        console.warn('WebRTC failed', e);
        setManualConnectMsg('WebRTC failed, trying libp2p...');
      }
    }

    const candidates = [
      `/dns4/node.cyberfly.io/tcp/31002/wss/p2p/12D3KooWA8mwP9wGUc65abVDMuYccaAMAkXhKUqpwKUZSN5McDrw/p2p-circuit/p2p/${target}`,
      `/p2p/${target}`,
    ];

    for (const c of candidates) {
      try {
        await lp.dial(multiaddr(c));
        setManualConnectMsg(`Connected via ${c}`);
        return;
      } catch (e) {
        console.warn('Dial failed', c, e);
      }
    }
    setManualConnectMsg('All connection attempts failed');
  };

  // --- Render ---
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={700}>
          P2P Video Stream
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Channel Control
                  </Typography>
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Source
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                      <Stack direction="row" spacing={1} sx={{ mr: 1 }}>
                        <Button
                          size="small"
                          variant={sourceMode === 'camera' ? 'contained' : 'outlined'}
                          onClick={() => setSourceMode('camera')}
                        >
                          Camera
                        </Button>
                        <Button
                          size="small"
                          variant={sourceMode === 'file' ? 'contained' : 'outlined'}
                          onClick={() => setSourceMode('file')}
                        >
                          File
                        </Button>
                        <Button
                          size="small"
                          variant={sourceMode === 'file-audio' ? 'contained' : 'outlined'}
                          onClick={() => setSourceMode('file-audio')}
                        >
                          File + Camera Audio
                        </Button>
                      </Stack>
                      <input
                        type="file"
                        accept="video/*"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setSelectedFile(f);
                          if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
                          fileUrlRef.current = URL.createObjectURL(f);
                          if (videoLocalRef.current) {
                            videoLocalRef.current.src = fileUrlRef.current;
                            videoLocalRef.current.play().catch(() => {});
                          }
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => {
                          if (fileInputRef.current) fileInputRef.current.value = '';
                          setSelectedFile(null);
                          if (fileUrlRef.current) {
                            URL.revokeObjectURL(fileUrlRef.current);
                            fileUrlRef.current = null;
                          }
                          if (videoLocalRef.current) videoLocalRef.current.src = '';
                        }}
                      >
                        Clear
                      </Button>
                    </Stack>
                  </Box>
                  {selfPeerId && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Your Peer ID
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography
                          component="span"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.65rem',
                            wordBreak: 'break-all',
                            bgcolor: 'action.hover',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            flex: 1,
                          }}
                        >
                          {selfPeerId}
                        </Typography>
                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(selfPeerId)}>
                          <ContentCopy fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </Box>
                  )}
                  <TextField
                    label="Channel"
                    size="small"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value.trim())}
                    disabled={broadcasting || subscribed}
                    helperText={`Topic: ${topicName}`}
                  />
                  <Stack direction="row" spacing={1}>
                    {!broadcasting ? (
                      <Button
                        variant="contained"
                        startIcon={<Videocam />}
                        onClick={startBroadcast}
                        disabled={libp2pInitializing || !libp2pState}
                      >
                        Broadcast
                      </Button>
                    ) : (
                      <Button variant="outlined" color="error" startIcon={<Stop />} onClick={stopBroadcast}>
                        Stop
                      </Button>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        label={libp2pState ? 'Libp2p Connected' : 'Libp2p Disconnected'}
                        color={libp2pState ? 'success' : 'error'}
                        variant="outlined"
                      />
                      {!libp2pState && (
                        <Button size="small" variant="outlined" onClick={ensureLibp2p} disabled={libp2pInitializing}>
                          {libp2pInitializing ? 'Connecting...' : 'Connect Libp2p'}
                        </Button>
                      )}
                    </Box>
                    {!subscribed ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<PlayArrow />}
                        onClick={subscribe}
                        disabled={broadcasting || libp2pInitializing || !libp2pState}
                      >
                        View
                      </Button>
                    ) : (
                      <Button variant="outlined" color="warning" onClick={unsubscribe}>
                        Leave
                      </Button>
                    )}
                  </Stack>
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Connection Type
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                      <Button
                        size="small"
                        variant={connectionType === 'webrtc' ? 'contained' : 'outlined'}
                        onClick={() => setConnectionType('webrtc')}
                        disabled={broadcasting || subscribed}
                      >
                        WebRTC
                      </Button>
                      <Button
                        size="small"
                        variant={connectionType === 'libp2p-protocol' ? 'contained' : 'outlined'}
                        onClick={() => setConnectionType('libp2p-protocol')}
                        disabled={broadcasting || subscribed}
                      >
                        libp2p Protocol
                      </Button>
                      <FormControlLabel
                        control={
                          <Switch size="small" checked={useWebRTC} onChange={(e) => setUseWebRTC(e.target.checked)} />
                        }
                        label={<Typography variant="caption">Enable WebRTC</Typography>}
                        disabled={broadcasting || subscribed}
                      />
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={`Peers: ${peerCount}`} />
                    <Chip
                      label={broadcasting ? 'Broadcasting' : subscribed ? 'Viewing' : 'Idle'}
                      color={broadcasting ? 'success' : subscribed ? 'info' : 'default'}
                    />
                    {webrtcConnections.length > 0 && <Chip label={`WebRTC: ${webrtcConnections.length}`} color="primary" />}
                    {participants.length > 0 && <Chip label={`Participants: ${participants.length}`} color="primary" />}
                    {mimeType && <Chip label={mimeType} />}
                    {lagMs > 0 && <Chip label={`Lag ~${lagMs}ms`} />}
                    <Chip
                      label={connectionType === 'webrtc' ? 'WebRTC Mode' : 'Protocol Mode'}
                      variant="outlined"
                    />
                    {subscribed && (
                      <Chip
                        label={`Frames: ${streamHealth.framesReceived}`}
                        color={streamHealth.isStalled ? 'error' : streamHealth.framesReceived > 0 ? 'success' : 'default'}
                        variant={streamHealth.isStalled ? 'filled' : 'outlined'}
                      />
                    )}
                    {subscribed && streamHealth.bufferHealth !== 'unknown' && (
                      <Chip
                        label={`Buffer: ${streamHealth.bufferHealth}`}
                        color={
                          streamHealth.bufferHealth === 'healthy'
                            ? 'success'
                            : streamHealth.bufferHealth === 'low'
                            ? 'warning'
                            : 'error'
                        }
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  <FormControlLabel
                    sx={{ mt: -1 }}
                    control={<Switch size="small" checked={debugLog} onChange={(e) => setDebugLog(e.target.checked)} />}
                    label={<Typography variant="caption">Debug Logging</Typography>}
                  />
                  {subscribed && (
                    <Box sx={{ mt: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color={streamHealth.isStalled ? 'error' : 'primary'}
                          onClick={() => {
                            resetMediaSourcePipeline();
                            const lp = libp2pState;
                            if (lp) {
                              lp.services.pubsub.publish(
                                topicName,
                                new TextEncoder().encode(
                                  JSON.stringify({
                                    type: 'request-init',
                                    ts: Date.now(),
                                    from: lp.peerId.toString(),
                                    reason: 'manual-recovery',
                                  })
                                )
                              ).catch(() => {});
                            }
                          }}
                        >
                          {streamHealth.isStalled ? 'Fix Stalled Stream' : 'Restart Stream'}
                        </Button>
                        {streamHealth.isStalled && (
                          <Typography variant="caption" color="error">
                            Stream appears stalled - no frames for{' '}
                            {Math.floor((Date.now() - lastFrameTimeRef.current) / 1000)}s
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      try {
                        const lp = libp2pState;
                        if (!lp) return;
                        const topics = lp.services.pubsub.getTopics?.() || [];
                        console.log('[DEBUG] Topics:', topics);
                        if (lp.services.pubsub.getSubscribers) {
                          const subs = lp.services.pubsub.getSubscribers(topicName) || [];
                          console.log('[DEBUG] Subscribers:', [...subs].map((p) => p.toString?.() || p));
                        }
                      } catch (e) {
                        console.warn('Debug failed', e);
                      }
                    }}
                  >
                    Topics/Subs
                  </Button>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Manual Peer Connect</Typography>
                    <TextField
                      size="small"
                      placeholder="Peer ID"
                      value={manualPeerId}
                      onChange={(e) => setManualPeerId(e.target.value)}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained" onClick={connectToManualPeer}>
                        Connect
                      </Button>
                      {manualConnectMsg && (
                        <Typography variant="caption" sx={{ alignSelf: 'center' }}>
                          {manualConnectMsg}
                        </Typography>
                      )}
                    </Stack>
                    {connectionsSnapshot.length > 0 && (
                      <Box sx={{ maxHeight: 100, overflowY: 'auto', border: '1px dashed', p: 1, borderRadius: 1 }}>
                        {connectionsSnapshot.map((c) => (
                          <Typography key={c.id} variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                            {c.id} • streams:{c.streams} • {c.status}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    {webrtcConnections.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          WebRTC Connections
                        </Typography>
                        <Box
                          sx={{
                            mt: 0.5,
                            maxHeight: 100,
                            overflowY: 'auto',
                            p: 1,
                            border: '1px solid',
                            borderColor: 'success.main',
                            borderRadius: 1,
                            bgcolor: 'success.light',
                            opacity: 0.9,
                          }}
                        >
                          {webrtcConnections.map((peerId) => (
                            <Stack key={peerId} direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                              <Typography
                                component="span"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.6rem',
                                  wordBreak: 'break-all',
                                  flex: 1,
                                  color: 'success.dark',
                                }}
                              >
                                {peerId} • WebRTC
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                  const pc = peerConnectionsRef.current.get(peerId);
                                  if (pc) {
                                    pc.close();
                                    peerConnectionsRef.current.delete(peerId);
                                    setWebrtcConnections((prev) => prev.filter((id) => id !== peerId));
                                  }
                                }}
                              >
                                Disconnect
                              </Button>
                            </Stack>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Stack>
                  {participants.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Participants
                      </Typography>
                      <Box
                        sx={{
                          mt: 0.5,
                          maxHeight: 140,
                          overflowY: 'auto',
                          p: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        {participants.map((pid) => (
                          <Stack key={pid} direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography
                              component="span"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.6rem',
                                wordBreak: 'break-all',
                                flex: 1,
                              }}
                            >
                              {pid}
                            </Typography>
                            <IconButton size="small" onClick={() => navigator.clipboard.writeText(pid)}>
                              <ContentCopy fontSize="inherit" />
                            </IconButton>
                          </Stack>
                        ))}
                      </Box>
                    </Box>
                  )}
                  {broadcasting && lastChunkTs && (
                    <Typography variant="caption" color="text.secondary">
                      Last chunk: {lastChunkTs.toLocaleTimeString()}
                    </Typography>
                  )}
                  {libp2pInitializing && <LinearProgress />}
                  <Alert severity="info" variant="outlined" sx={{ fontSize: '0.75rem' }}>
                    Experimental peer-assisted live streaming using libp2p pubsub. Short segments are relayed through the
                    gossip network. Performance depends on codec support and network conditions.
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Local
                      </Typography>
                      <video
                        ref={videoLocalRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ width: '100%', borderRadius: 8, background: '#000' }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          Remote
                        </Typography>
                        {subscribed && <Chip size="small" color="success" label="LIVE" />}
                      </Stack>
                      <video
                        ref={(el) => {
                          videoRemoteRef.current = el;
                          videoRef.current = el;
                        }}
                        autoPlay
                        playsInline
                        muted={remoteMuted}
                        controls={!broadcasting && subscribed}
                        style={{ width: '100%', borderRadius: 8, background: '#000' }}
                      />
                      {subscribed && (
                        <Button
                          size="small"
                          sx={{ mt: 1 }}
                          variant="outlined"
                          onClick={() => {
                            setRemoteMuted((m) => !m);
                            if (videoRemoteRef.current) {
                              videoRemoteRef.current.muted = !remoteMuted;
                              videoRemoteRef.current.play().catch(() => {});
                            }
                          }}
                        >
                          {remoteMuted ? 'Unmute' : 'Mute'}
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Stack>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={closeMsg}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StreamPage;
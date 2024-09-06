import React, { useEffect, useRef, useState } from 'react';
import { startLibp2pNode } from '../services/libp2p-services';
import { multiaddr } from '@multiformats/multiaddr'


const VideoStreaming = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peerId, setPeerId] = useState(null);
  const [libp2p, setLibp2p] = useState(null);
  const [remotePeerIdInput, setRemotePeerIdInput] = useState('');

  useEffect(() => {
    const initLibp2p = async () => {
      try {
      
        const node = await startLibp2pNode()
        setLibp2p(node);
        setPeerId(node.peerId.toString());

        // Handle incoming video streams
        await node.handle('/video/1.0.0', async ({ stream }) => {
          console.log('Received incoming stream');
          if (!stream || typeof stream.source !== 'object') {
            console.error('Invalid stream object:', stream);
            return;
          }

          const reader = stream.source;
          const mediaSource = new MediaSource();
          remoteVideoRef.current.src = URL.createObjectURL(mediaSource);

          mediaSource.addEventListener('sourceopen', async () => {
            const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
            try {
              for await (const chunk of reader) {
                if (chunk instanceof Uint8Array) {
                  sourceBuffer.appendBuffer(chunk);
                } else {
                  console.error('Invalid chunk:', chunk);
                }
              }
            } catch (err) {
              console.error('Error processing stream:', err);
            }
          });
        });
      } catch (err) {
        console.error('Error initializing libp2p:', err);
      }
    };

    initLibp2p();

    return () => {
      if (libp2p) {
        libp2p.stop().catch(err => console.error('Error stopping libp2p:', err));
      }
    };
  }, []);

  const startStreaming = async () => {
    if (!libp2p) {
      console.error('libp2p not initialized');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      localVideoRef.current.srcObject = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs="vp8"' });
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && libp2p) {
          try {
            const { stream } = await libp2p.dialProtocol(remotePeerIdInput, '/video/1.0.0');
            if (!stream || typeof stream.sink !== 'function') {
              console.error('Invalid stream object:', stream);
              return;
            }
            const writer = stream.sink;
            await writer(new Uint8Array(await event.data.arrayBuffer()));
          } catch (err) {
            console.error('Failed to send video data:', err);
          }
        }
      };
      mediaRecorder.start(1000); // Send data every second
    } catch (err) {
      console.error('Error starting streaming:', err);
    }
  };

  const dialPeer = async () => {
    if (!libp2p || !remotePeerIdInput) {
      console.error('libp2p not initialized or remote peer ID not provided');
      return;
    }

    try {
      const ma = multiaddr(`/p2p/${remotePeerIdInput}`);
      const connection = await libp2p.dial(ma);
      console.log('Connected to peer:', connection.remotePeer.toString());
    } catch (err) {
      console.error('Failed to connect to peer:', err);
    }
  };

  return (
    <div>
      <h1>libp2p Video Streaming</h1>
      <p>Your Peer ID: {peerId}</p>
      <div>
        <h2>Local Video</h2>
        <video ref={localVideoRef} autoPlay playsInline muted />
        <button onClick={startStreaming}>Start Streaming</button>
      </div>
      <div>
        <h2>Remote Video</h2>
        <video ref={remoteVideoRef} autoPlay playsInline />
        <input 
          type="text" 
          value={remotePeerIdInput} 
          onChange={(e) => setRemotePeerIdInput(e.target.value)} 
          placeholder="Enter remote peer ID"
        />
        <button onClick={dialPeer}>Connect to Peer</button>
      </div>
    </div>
  );
};

export default VideoStreaming;
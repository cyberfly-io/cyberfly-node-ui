import React, { useEffect, useRef, useState, useCallback } from 'react';
import { startLibp2pNode } from '../services/libp2p-services';
import { multiaddr } from '@multiformats/multiaddr'

const VideoStreaming = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [peerId, setPeerId] = useState(null);
  const [libp2p, setLibp2p] = useState(null);
  const [remotePeerIdInput, setRemotePeerIdInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

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
          if (remoteVideoRef.current) {
            remoteVideoRef.current.src = URL.createObjectURL(mediaSource);
          }

          mediaSource.addEventListener('sourceopen', async () => {
            const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8,opus"');
            let queue = [];
            let isAppending = false;

            const appendNextBuffer = async () => {
              if (queue.length === 0 || isAppending) return;
              isAppending = true;
              try {
                sourceBuffer.appendBuffer(queue.shift());
              } catch (err) {
                console.error('Error appending buffer:', err);
              }
            };

            sourceBuffer.addEventListener('updateend', () => {
              isAppending = false;
              appendNextBuffer();
            });

            try {
              for await (const chunk of reader) {
                if (chunk instanceof Uint8Array) {
                  queue.push(chunk);
                  if (!isAppending) {
                    appendNextBuffer();
                  }
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
      stopStreaming();
    };
  }, []);

  const stopStreaming = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startStreaming = useCallback(async () => {
    if (!libp2p || !remotePeerIdInput) {
      console.error('libp2p not initialized or no remote peer ID');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 600000,
      });

      mediaRecorderRef.current = mediaRecorder;
      
      let chunks = [];
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          if (chunks.length >= 1 && libp2p && remotePeerIdInput) {
            try {
              const blob = new Blob(chunks, { type: 'video/webm' });
              chunks = [];
              
              // Fixed dialing logic
              const peerIdString = remotePeerIdInput.includes('/p2p/') 
                ? remotePeerIdInput.split('/p2p/')[1] 
                : remotePeerIdInput;
                
              const { stream } = await libp2p.dialProtocol(peerIdString, '/video/1.0.0');
              
              if (!stream || typeof stream.sink !== 'function') {
                console.error('Invalid stream object:', stream);
                return;
              }
              const writer = stream.sink;
              await writer(new Uint8Array(await blob.arrayBuffer()));
            } catch (err) {
              console.error('Failed to send video data:', err);
            }
          }
        }
      };

      mediaRecorder.start(100);
      setIsStreaming(true);
    } catch (err) {
      console.error('Error starting streaming:', err);
      setIsStreaming(false);
    }
  }, [libp2p, remotePeerIdInput]);

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
        {!isStreaming ? (
          <button onClick={startStreaming}>Start Streaming</button>
        ) : (
          <button onClick={stopStreaming}>Stop Streaming</button>
        )}
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
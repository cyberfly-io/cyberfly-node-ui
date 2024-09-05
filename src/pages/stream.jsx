import { useState, useRef, useEffect, useCallback } from "react";
import { startLibp2pNode } from "../services/libp2p-services";
import { multiaddr } from '@multiformats/multiaddr';
import { pipe } from 'it-pipe';

const WebcamStreaming = () => {
  const [node, setNode] = useState(null);
  const [peerId, setPeerId] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [peerAddress, setPeerAddress] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const mediaRecorder = useRef(null);
  const mediaSource = useRef(null);
  const sourceBuffer = useRef(null);
  const chunks = useRef([]);

  useEffect(() => {
    const startLibp2p = async () => {
      try {
        const node = await startLibp2pNode();
        setNode(node);
        setPeerId(node.peerId.toString());

        node.handle('/webcam', async ({ stream: libp2pStream }) => {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const videoTrack = stream.getVideoTracks()[0];
          const mediaStream = new MediaStream([videoTrack]);

          mediaRecorder.current = new MediaRecorder(mediaStream, { mimeType: 'video/webm; codecs=vp9' });
          mediaRecorder.current.ondataavailable = async (event) => {
            if (event.data.size > 0) {
              try {
                const chunk = new Uint8Array(await event.data.arrayBuffer());
                await libp2pStream.sink([chunk]);
              } catch (error) {
                console.error("Failed to push data to stream:", error);
              }
            }
          };

          mediaRecorder.current.start(1000); // Capture in 1-second chunks
        });
      } catch (error) {
        console.error("Error starting libp2p node:", error);
      }
    };

    startLibp2p();

    return () => {
      // Cleanup
      if (mediaRecorder.current) {
        mediaRecorder.current.stop();
      }
      if (node) {
        node.stop();
      }
    };
  }, []);

  const startStreaming = useCallback(async () => {
    if (!node) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
    } catch (error) {
      console.error("Error starting local stream:", error);
    }
  }, [node]);

  const connectToPeer = useCallback(async () => {
    if (!node) return;

    try {
      const conn = await node.dial(multiaddr(peerAddress));
      const stream = await conn.newStream('/webcam');

      mediaSource.current = new MediaSource();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.src = URL.createObjectURL(mediaSource.current);
      }

      mediaSource.current.addEventListener('sourceopen', async () => {
        try {
          sourceBuffer.current = mediaSource.current.addSourceBuffer('video/webm; codecs="vp9"');
        } catch (e) {
          console.error('Error adding source buffer:', e);
          return;
        }

        const appendChunks = async () => {
          if (!sourceBuffer.current.updating && chunks.current.length > 0) {
            const blob = new Blob(chunks.current, { type: 'video/webm; codecs="vp9"' });
            const chunk = new Uint8Array(await blob.arrayBuffer());
            try {
              if (mediaSource.current.readyState === 'open') {
                sourceBuffer.current.appendBuffer(chunk);
                chunks.current = [];
              } else {
                console.error('MediaSource is not open');
              }
            } catch (e) {
              console.error('Error appending buffer:', e);
            }
          }
        };

        sourceBuffer.current.addEventListener('updateend', appendChunks);

        try {
          await pipe(
            stream,
            async function (source) {
              for await (const chunk of source) {
                chunks.current.push(chunk);
                // Adjust chunk size and append logic based on performance and network conditions
                if (chunks.current.length >= 10) {
                  await appendChunks();
                }
              }
              // Append any remaining chunks
              await appendChunks();
            }
          );
        } catch (e) {
          console.error('Error piping stream:', e);
        }
      });

      mediaSource.current.addEventListener('sourceended', () => {
        console.log('MediaSource ended');
      });

      mediaSource.current.addEventListener('sourceclose', () => {
        console.log('MediaSource closed');
      });

    } catch (error) {
      console.error('Failed to connect to peer:', error);
    }
  }, [node, peerAddress]);

  return (
    <div>
      <h1>Libp2p Webcam Streaming (WebSocket)</h1>
      <p>Your PeerId: {peerId}</p>
      <button onClick={startStreaming} disabled={isStreaming}>
        {isStreaming ? 'Streaming...' : 'Start Streaming'}
      </button>
      <video ref={localVideoRef} autoPlay playsInline muted />

      <div>
        <input
          type="text"
          value={peerAddress}
          onChange={(e) => setPeerAddress(e.target.value)}
          placeholder="Enter peer multiaddr"
        />
        <button onClick={connectToPeer}>Connect to Peer</button>
      </div>

      <video ref={remoteVideoRef} autoPlay playsInline />
    </div>
  );
};

export default WebcamStreaming;
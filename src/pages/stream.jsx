import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createLibp2p } from 'libp2p'
import { webRTC } from '@libp2p/webrtc'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { identify } from '@libp2p/identify'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { PageContainer } from '@ant-design/pro-components';
import { Card, Space, Typography, Button, Input, Divider, Tag } from 'antd';
import { VideoCameraOutlined, GlobalOutlined, UserOutlined, ThunderboltOutlined } from '@ant-design/icons';

const VideoStreamer = () => {
  const [node, setNode] = useState(null)
  const [peerId, setPeerId] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')
  const [connectedPeers, setConnectedPeers] = useState([])
  const [isStreamingLocal, setIsStreamingLocal] = useState(false)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const peerConnectionsRef = useRef(new Map())

  const initializeNode = useCallback(async () => {
    try {
      const libp2pNode = await createLibp2p({
        transports: [webRTC(),
          circuitRelayTransport({
            discoverRelays: 1
          })
        ],
        connectionEncryption: [noise()],
        streamMuxer: [yamux()],
        peerDiscovery: [
          bootstrap({
            list: [
              '/ip4/139.99.91.128/tcp/31001/p2p/12D3KooWSfGgUaeogSZuRPa4mhsAU41qJH5EpmwKg9wGVzUwFGth'
            ]
          })
        ],
        services: {
          identify: identify()
        }
      })

      // Add peer discovery listener
      libp2pNode.addEventListener('peer:discovery', (event) => {
        const peerId = event.detail.id.toString()
        console.log('Discovered peer:', peerId)
        setConnectedPeers(prev => [...new Set([...prev, peerId])])
      })

      // Add connection listener
      libp2pNode.addEventListener('peer:connect', (event) => {
        const peerId = event.detail.remotePeer.toString()
        setConnectionStatus(`Connected to ${peerId}`)
      })

      await libp2pNode.start()
      setNode(libp2pNode)
      setPeerId(libp2pNode.peerId.toString())
      
      return libp2pNode
    } catch (error) {
      console.error('Failed to initialize libp2p node:', error)
      setConnectionStatus('Initialization Failed')
    }
  }, [])

  const startVideoCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      mediaStreamRef.current = stream
      localVideoRef.current.srcObject = stream
      localVideoRef.current.play()
      setIsStreamingLocal(true)
      
      // Prepare for potential peer streaming
      await receiveVideoStream()
    } catch (error) {
      console.error('Error accessing media devices:', error)
    }
  }, [node])

  const connectToPeer = useCallback(async (peerMultiaddr) => {
    if (!node) return null

    try {
      const peer = await node.dial(peerMultiaddr)
      const remotePeerId = peer.remotePeer.toString()
      
      // Store peer connection
      peerConnectionsRef.current.set(remotePeerId, peer)
      
      setConnectedPeers(prev => [...new Set([...prev, remotePeerId])])
      setConnectionStatus(`Connected to ${remotePeerId}`)
      
      return peer
    } catch (error) {
      console.error('Failed to connect to peer:', error)
      setConnectionStatus('Connection Failed')
      return null
    }
  }, [node])

  const streamVideoToPeer = useCallback(async (peer) => {
    const videoStream = mediaStreamRef.current

    if (!videoStream) {
      console.error('No media stream available')
      return
    }

    try {
      const stream = await peer.newStream(['/video-stream/1.0.0'])
      const tracks = videoStream.getTracks()
      
      for (const track of tracks) {
        stream.write(track)
      }
      
      console.log('Video stream started to peer')
    } catch (error) {
      console.error('Failed to stream video:', error)
    }
  }, [])

  const receiveVideoStream = useCallback(async () => {
    if (!node) return

    await node.handle('/video-stream/1.0.0', async ({ stream }) => {
      try {
        const receivedTracks = []
        
        for await (const track of stream) {
          receivedTracks.push(track)
        }

        const remoteStream = new MediaStream(receivedTracks)
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.play()
      } catch (error) {
        console.error('Error receiving video stream:', error)
      }
    })
  }, [node])

  const stopVideoStream = useCallback(() => {
    // Stop local media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    // Disconnect all peers
    peerConnectionsRef.current.forEach((peer, peerId) => {
      try {
        peer.close()
      } catch (error) {
        console.error(`Error closing connection to ${peerId}:`, error)
      }
    })
    
    // Reset states
    peerConnectionsRef.current.clear()
    setConnectedPeers([])
    setConnectionStatus('Disconnected')
    setIsStreamingLocal(false)
  }, [])

  // Initialize node on component mount
  useEffect(() => {
    initializeNode()
    
    return () => {
      if (node) {
        node.stop()
      }
    }
  }, [initializeNode])

  const [peerAddress, setPeerAddress] = useState('')

  const handleConnectToPeer = useCallback(async () => {
    const peer = await connectToPeer(peerAddress)
    if (peer && isStreamingLocal) {
      await streamVideoToPeer(peer)
    }
  }, [connectToPeer, streamVideoToPeer, peerAddress, isStreamingLocal])

  return (
    <PageContainer
      title={
        <Space>
          <VideoCameraOutlined />
          <span>Video Streaming</span>
        </Space>
      }
      subTitle="Real-time video streaming over libp2p network"
      header={{
        style: { padding: '16px 0' }
      }}
    >
      <Card style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Typography.Text strong>Peer ID:</Typography.Text>
            <Tag color={peerId ? 'green' : 'red'}>
              {peerId ? `${peerId.substring(0, 20)}...` : 'Not initialized'}
            </Tag>
          </div>
          <div>
            <Typography.Text strong>Connection Status:</Typography.Text>
            <Tag color={connectionStatus === 'Connected' ? 'green' : 'orange'}>
              {connectionStatus}
            </Tag>
          </div>
          <div>
            <Typography.Text strong>Connected Peers:</Typography.Text>
            <Typography.Text>{connectedPeers.length}</Typography.Text>
          </div>
        </Space>
      </Card>

      <Card title="Stream Controls" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Enter peer multiaddress"
            value={peerAddress}
            onChange={(e) => setPeerAddress(e.target.value)}
            prefix={<GlobalOutlined />}
          />
          <Space wrap style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              type="primary"
              icon={<VideoCameraOutlined />}
              onClick={startVideoCapture}
              disabled={isStreamingLocal}
              size="large"
              style={{ minWidth: '140px' }}
            >
              Start Streaming
            </Button>
            <Button
              icon={<UserOutlined />}
              onClick={handleConnectToPeer}
              disabled={!isStreamingLocal || !peerAddress}
              size="large"
              style={{ minWidth: '140px' }}
            >
              Connect to Peer
            </Button>
            <Button
              danger
              icon={<ThunderboltOutlined />}
              onClick={stopVideoStream}
              disabled={!isStreamingLocal}
              size="large"
              style={{ minWidth: '140px' }}
            >
              Stop Streaming
            </Button>
          </Space>
        </Space>
      </Card>

      <Card title="Video Streams">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          minHeight: '300px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Typography.Title level={5}>Local Stream</Typography.Title>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto',
              aspectRatio: '16/9',
              background: '#000',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Typography.Title level={5}>Remote Stream</Typography.Title>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto',
              aspectRatio: '16/9',
              background: '#000',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  )
}

export default VideoStreamer
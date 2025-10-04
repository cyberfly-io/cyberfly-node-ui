import { identify } from '@libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { bootstrap } from '@libp2p/bootstrap';
import { webRTC, webRTCDirect } from '@libp2p/webrtc'
import { all } from '@libp2p/websockets/filters'
import { preSharedKey } from '@libp2p/pnet'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { webTransport } from '@libp2p/webtransport'
import { kadDHT } from '@libp2p/kad-dht'
import { autoNAT } from '@libp2p/autonat'
import { dcutr } from '@libp2p/dcutr'
import { ping } from '@libp2p/ping'

const swarmKey = `/key/swarm/psk/1.0.0/
/base16/
8463a7707bad09f63538d273aa769cbdd732e43b07f207d88faa323566168ad3`;

 const getLibp2pOptions = ()=> {
  return {
    connectionGater: {
      denyDialMultiaddr: () => false,
    },
    connectionManager: {
      maxConnections: 100,
      minConnections: 5,
      reconnectRetries: 10,
      maxPeerAddrsToDial: 50,
      maxParallelReconnects: 5,
      maxIncomingPendingConnections: 50,
      inboundConnectionThreshold: 25,
    },
    peerDiscovery: [
      bootstrap({
        list: [
          '/dns4/node.cyberfly.io/tcp/31002/wss/p2p/12D3KooWA8mwP9wGUc65abVDMuYccaAMAkXhKUqpwKUZSN5McDrw',
          '/dns4/node.cyberfly.io/tcp/31002/ws/p2p/12D3KooWA8mwP9wGUc65abVDMuYccaAMAkXhKUqpwKUZSN5McDrw',
        ],
        tagName: 'keep-alive',
      }),
    pubsubPeerDiscovery({
      interval: 10000,
      topics: ["cyberfly._peer-discovery._p2p._pubsub"],
      listenOnly: false,
    }),
    ],
    connectionProtector: preSharedKey({
      psk: uint8ArrayFromString(swarmKey) 
    }),
    addresses: {
      listen: ['/webrtc',       
        '/p2p-circuit',
]
    },
    transports: [
        webSockets({
            filter: all
          }),
          webRTC(),
                webRTCDirect(),
      webTransport(),

          circuitRelayTransport(),
    ],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    services: {
      identify: identify(),
      // Enable emitSelf so publisher can observe its own messages for diagnostics
      pubsub: gossipsub({
        allowPublishToZeroTopicPeers: true,
        emitSelf: true,
        canRelayMessage: true,
        doPX: true,
        scoreThresholds: {
          gossipThreshold: -Infinity,
          publishThreshold: -Infinity,
          graylistThreshold: -Infinity,
        },
      }),
      // KadDHT for peer and content routing
      dht: kadDHT({
        clientMode: false, // Act as both client and server
        protocol: '/ipfs/kad/1.0.0',
      }),
      // AutoNAT for NAT detection and hole punching assistance
      autoNAT: autoNAT(),
      // DCUtR for direct connection upgrade via relay
      dcutr: dcutr(),
      // Ping service for connection health checks
      ping: ping({
        protocolPrefix: 'ipfs',
        maxInboundStreams: 32,
        maxOutboundStreams: 64,
        timeout: 30000, // 30 seconds
      }),
    }
  }
}

export const startLibp2pNode = async()=>{
  try{
    const libp2p = await createLibp2p(getLibp2pOptions())
    console.log(libp2p)
    // Expose globally for manual console diagnostics
    if (typeof window !== 'undefined') {
      window.__lp = libp2p
    }
    return libp2p
  }
  catch(e){
     console.log(e)
  }
    
}
import { identify } from '@libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { webRTC, webRTCDirect } from '@libp2p/webrtc'
import { webTransport } from '@libp2p/webtransport'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { dcutr } from '@libp2p/dcutr'
import {mplex} from "@libp2p/mplex";
import { kadDHT } from '@libp2p/kad-dht'


 const getLibp2pOptions = ()=> {
  return {
    peerDiscovery: [
    pubsubPeerDiscovery({
      interval: 10000,
      topics: ["cyberfly._peer-discovery._p2p._pubsub"],
      listenOnly: false,
    }),
    ],
    addresses: {
      listen: ['/webrtc']
    },
    transports: [
        webSockets({
            // this allows non-secure WebSocket connections for purposes of the demo
            filter: filters.all
          }),
          // support dialing/listening on WebRTC addresses
          webTransport(),
          // support dialing/listening on Circuit Relay addresses
          circuitRelayTransport({
            // make a reservation on any discovered relays - this will let other
            // peers use the relay to contact us
            discoverRelays: 1
          }),
          webRTC({
            rtcConfiguration: {
              iceServers: [{
                urls: [
                  'stun:stun.l.google.com:19302',
                  'stun:global.stun.twilio.com:3478'
                ]
              }]
            }
          }),
          webRTCDirect(),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux(), mplex()],
    services: {
      identify: identify(),
      pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
      dcutr: dcutr(),
      dht: kadDHT({
        protocol: "/cyberfly-connectivity/kad/1.0.0",
        maxInboundStreams: 5000,
        maxOutboundStreams: 5000,
        clientMode: true,
      }),

    }
  }
}

export const startLibp2pNode = async()=>{
    const libp2p = await createLibp2p(getLibp2pOptions())
    return libp2p
}
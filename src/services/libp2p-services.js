import { identify } from '@libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { webRTC } from '@libp2p/webrtc'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { dcutr } from '@libp2p/dcutr'
import {mplex} from "@libp2p/mplex";

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
          webRTC(),
          // support dialing/listening on Circuit Relay addresses
          circuitRelayTransport({
            // make a reservation on any discovered relays - this will let other
            // peers use the relay to contact us
            discoverRelays: 1
          })
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux(), mplex()],
    services: {
      identify: identify(),
      pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
      dcutr: dcutr()

    }
  }
}

export const startLibp2pNode = async()=>{
    const libp2p = await createLibp2p(getLibp2pOptions())
    return libp2p
}
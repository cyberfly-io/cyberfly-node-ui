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
import { autoNAT } from "@libp2p/autonat";
import { bootstrap } from '@libp2p/bootstrap';
import { bootStrapNode } from '../constants/contextConstants';


 const getLibp2pOptions = ()=> {
  return {
    connectionGater: {
      denyDialMultiaddr: () => false,
    },
    peerDiscovery: [
      bootstrap({
        list: [bootStrapNode],
        timeout: 0,
      }),
    pubsubPeerDiscovery({
      interval: 10000,
      topics: ["cyberfly._peer-discovery._p2p._pubsub"],
      listenOnly: false,
    }),
    ],
    addresses: {
      listen: ['/webrtc', '/webtransport']
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
      autoNAT: autoNAT(),
      dcutr: dcutr(),

    }
  }
}

export const startLibp2pNode = async()=>{
  try{
    const libp2p = await createLibp2p(getLibp2pOptions())
    console.log(libp2p)
    return libp2p
  }
  catch(e){
     console.log(e)
  }
    
}
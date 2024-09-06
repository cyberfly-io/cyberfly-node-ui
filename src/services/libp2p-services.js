import { identify } from '@libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import {mplex} from "@libp2p/mplex";
import { bootstrap } from '@libp2p/bootstrap';
import { bootStrapNode } from '../constants/contextConstants';
import { webRTC } from '@libp2p/webrtc'
import { all } from '@libp2p/websockets/filters'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'

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
      listen: ['/webrtc']
    },
    transports: [
        webSockets({
            filter: all
          }),
          webRTC(),
          circuitRelayTransport({
            discoverRelays: 1
          })
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux(), mplex()],
    services: {
      identify: identify(),
      pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
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
import { createClient, Pact } from '@kadena/client';

const client = createClient('https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact',)

export const getNode = async (peerId) =>{
    const unsignedTransaction = Pact.builder
    .execution(`(free.cyberfly_node.get-node "${peerId}")`)
    .setMeta({
      chainId: '1',
      senderAccount: 'cyberfly-account-gas',
    })
    .setNetworkId('testnet04')
    .createTransaction();
  const res = await client.local(unsignedTransaction, { signatureVerification:false, preflight:false});
  return res
  }
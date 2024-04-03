import { createClient, Pact, createEckoWalletSign } from '@kadena/client';
import { notification } from 'antd';

const POLL_INTERVAL_S = 5;
const networkUrl = 'https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact'
const client = createClient(networkUrl,)

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

  const getGuard = (account, pubkey)=>{
    return {pred:"keys-any", keys:[account.split(':')[1], pubkey]}
  }

  export const registerNode = async (peerId, multiaddr, account, pubkey)=>{
    const utxn = Pact.builder.execution(`(free.cyberfly_node.new-node "${peerId}" "active" "${multiaddr}" "${account}" (read-keyset "ks"))`)
    .addData("ks",getGuard(account, pubkey))
    .addSigner(pubkey, (withCapability)=>[
      withCapability('free.cyberfly-account-gas-station.GAS_PAYER', 'cyberfly-account-gas', { int: 1 }, 1.0),
    ])
    .setMeta({chainId:"1",senderAccount:"cyberfly-account-gas", gasLimit:2000, gasPrice:0.0000001,ttl: 28000,})
    .setNetworkId("testnet04")
    .createTransaction();
    
    const  signTransaction = createEckoWalletSign()
    const signedTx = await signTransaction(utxn)
    const res = await client.local(signedTx)
    if(res.result.status==="success"){
      const txn = await client.submit(signedTx)
      console.log(txn)
      pollForTransaction(txn.requestKey, "Registering node", ()=>{console.log("node register success")})
    }
  }

export const pollForTransaction = async (requestKey, message, callback) => {
    let time_spent_polling_s = 0;
    let pollRes = null;
    let waitingText;
    const key = requestKey;
    notification.info({
      key,
      message: message + ' - ' + requestKey,
      duration: 50000,
      placement: 'bottomRight',
    });

    while (time_spent_polling_s < 240) {
      await wait(POLL_INTERVAL_S * 5000);
      try {
        pollRes = await client.pollStatus({requestKey:requestKey, chainId:"1", networkId:"testnet04"})
        console.log(pollRes)
      } catch (e) {
        console.log(e);
        notification.error({message:"Had trouble getting transaction update, will try again"});
        continue;
      }
      if (Object.keys(pollRes).length !== 0) {
        break;
      }
      time_spent_polling_s += POLL_INTERVAL_S;
      waitingText = `Waiting ${time_spent_polling_s + POLL_INTERVAL_S}s for transaction ${
        message + '-' + requestKey.slice(0, 10)
      }...`;
      notification.info({ key, message: waitingText, duration: 50000, placement: 'bottomRight' });
    }

    if (pollRes[requestKey].result.status === 'success') {
      notification.success({
        key,
        message: `${message} Succesfully completed ${requestKey.slice(0, 10)}...`,
        duration: 50000,
        placement: 'bottomRight',
      });
      if (callback !== null) {
        console.log('callback called');
        callback();
      }
      
    } else {
    
      notification.error({
        message: `${message} Failed transaction ${requestKey}...`,
        placement: 'bottomRight',
      });
    }
  };

  const wait = async (timeout) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  };
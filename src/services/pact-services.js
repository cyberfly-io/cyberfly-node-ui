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

  export const getMyNodes = async (account) =>{
    const unsignedTransaction = Pact.builder
    .execution(`(free.cyberfly_node.get-account-nodes "${account}")`)
    .setMeta({
      chainId: '1',
      senderAccount: 'cyberfly-account-gas',
      gasLimit: 150000
    })
    .setNetworkId('testnet04')
    .createTransaction();
  const res = await client.local(unsignedTransaction, { signatureVerification:false, preflight:false});
  return res.result.data
  }

  export const getNodeStake = async (peerId) =>{
    const unsignedTransaction = Pact.builder
    .execution(`(free.cyberfly_node.get-node-stake "${peerId}")`)
    .setMeta({
      chainId: '1',
      senderAccount: 'cyberfly-account-gas',
      gasLimit: 150000
    })
    .setNetworkId('testnet04')
    .createTransaction();
  const res = await client.local(unsignedTransaction, { signatureVerification:false, preflight:false});
  return res.result.data
  }

  export const getNodeClaimable = async (peerId) =>{
    const unsignedTransaction = Pact.builder
    .execution(`(free.cyberfly_node.calculate-days-and-reward "${peerId}")`)
    .setMeta({
      chainId: '1',
      senderAccount: 'cyberfly-account-gas',
      gasLimit: 150000
    })
    .setNetworkId('testnet04')
    .createTransaction();
  const res = await client.local(unsignedTransaction, { signatureVerification:false, preflight:false});
  return res.result.data
  }


  const getGuard = (account, pubkey)=>{
    return {pred:"keys-any", keys:[account.split(':')[1], pubkey]}
  }

  const getPubkey = (account)=>{
    return account.split(":")[1]
  }

  export const nodeStake = async (account, peerId)=>{
    const utxn = Pact.builder.execution(`(free.cyberfly_node.stake "${account}" "${peerId}")`)
    .addSigner(getPubkey(account), (withCapability)=>[
      withCapability('free.cyberfly-account-gas-station.GAS_PAYER', 'cyberfly-account-gas', { int: 1 }, 1.0),
      withCapability('free.cyberfly_node.ACCOUNT_AUTH', account),
      withCapability('free.cyberfly_node.NODE_GUARD', peerId),
      withCapability('free.cyberfly.TRANSFER', account, 'cyberfly-staking-bank', 50000.0),
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
      pollForTransaction(txn.requestKey, "Stake for a node", ()=>{console.log("Staking success")})
      return txn
    }
    else{
      notification.error({
        message: res.result.error.message,
        duration: 50000,
        placement: 'bottomRight',
      });
    }
  }

  export const nodeUnStake = async (account, peerId)=>{
    const utxn = Pact.builder.execution(`(free.cyberfly_node.unstake "${account}" "${peerId}")`)
    .addSigner(getPubkey(account), (withCapability)=>[
      withCapability('free.cyberfly-account-gas-station.GAS_PAYER', 'cyberfly-account-gas', { int: 1 }, 1.0),
      withCapability('free.cyberfly_node.ACCOUNT_AUTH', account),
      withCapability('free.cyberfly_node.BANK_DEBIT'),
      withCapability('free.cyberfly.TRANSFER', 'cyberfly-staking-bank', account, 50000.0),
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
      pollForTransaction(txn.requestKey, "Un Staking for a node", ()=>{console.log("UnStaking success")})
      return txn
    }
    else{
      notification.error({
        message: res.result.error.message,
        duration: 50000,
        placement: 'bottomRight',
      });
    }
  }

  export const claimReward = async (account, peerId)=>{
    const utxn = Pact.builder.execution(`(free.cyberfly_node.claim-reward "${account}" "${peerId}")`)
    .addSigner(getPubkey(account), (withCapability)=>[
      withCapability('free.cyberfly-account-gas-station.GAS_PAYER', 'cyberfly-account-gas', { int: 1 }, 1.0),
      withCapability('free.cyberfly_node.ACCOUNT_AUTH', account),
      withCapability('free.cyberfly_node.BANK_DEBIT'),
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
      pollForTransaction(txn.requestKey, "Claim reward for a node", ()=>{console.log("Claim success")})
      return txn
    }
    else{
      notification.error({
        message: res.result.error.message,
        duration: 50000,
        placement: 'bottomRight',
      });
    }
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
      return txn
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
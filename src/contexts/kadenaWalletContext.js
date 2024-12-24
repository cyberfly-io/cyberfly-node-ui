import React, { useState, createContext, useEffect, useCallback, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { connect } from '@kadena/spirekey-sdk';

import { NETWORKID} from '../constants/contextConstants'
import { message } from 'antd';

export const KadenaWalletContext = createContext();
export const useKadenaWalletContext = () => useContext(KadenaWalletContext);


const NETWORK = "testnet04"

const initialKadenaWalletState = {
    isConnected: false,
    isInstalled: false,
    NETWORK,
    account: null,
  };
  
  export const KadenaWalletProvider = (props) => {
    const [messageApi, contextHolder] = message.useMessage();

    const [kadenaExt, setKadenaExt] = useState(null);
    const [account, setAccount, removeAccount] = useLocalStorage('acct', { account: null, guard: null, balance: 0 });
    const [kadenaWalletState, setKadenaWalletState] = useLocalStorage('KadenaWalletState', initialKadenaWalletState);
    
    const initialize = useCallback(() => {
      const { kadena } = window;
      setKadenaExt(kadena);
      setKadenaWalletState({
        ...kadenaWalletState,
        isInstalled: Boolean(kadena?.isKadena),
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kadenaWalletState]);
  
    useEffect(() => {
      window.addEventListener('load', initialize);
    }, [initialize]);
  
    useEffect(() => {
      const registerEvents = async () => {
        if (kadenaExt) {
          kadenaExt.on('res_accountChange', async (response) => {
            console.log('X-Wallet: LISTEN res_accountChange', response);
            await checkStatus();
          });
          kadenaExt.on('res_checkStatus', onCheckStatusResponse);
          kadenaExt.on('res_sendKadena', (response) => {
            console.log('X-Wallet: LISTEN res_SendKadena', response);
          });
          kadenaExt.on('res_disconnect', () => {});
        }
      };
      registerEvents();
      if (kadenaExt && kadenaWalletState.isConnected) {
        setAccountData();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kadenaExt]);
  
    useEffect(() => {
      if (kadenaWalletState.isConnected && (!account?.account)) {
        disconnectWallet();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kadenaWalletState, account]);
  
    /**
     * Used by ConnectModal
     */



    const connectAccount = async () => {
      try {
        const account = await connect('testnet04', '1');
        // Wait for the account to be ready before proceeding
        await account.isReady();
        return account;
      } catch (error) {
        console.warn('User canceled sign-in', error);
      }
    };

    const initializeKadenaWallet = async (wallet_name) => {
   
      if(wallet_name==="eckoWallet"){
        const networkInfo = await getNetworkInfo();
        if (networkInfo==null){
          messageApi.warning("Please install eckowallet Extension")
        }
        else{
          if (networkInfo.networkId !== NETWORKID) {
            showNetworkError();
          } else {
            const connectResponse = await connectWallet();
            console.log('connectResponse', connectResponse);
            if (connectResponse?.status === 'success') {
              await setAccountData();
              messageApi.open({
                type: 'success',
                content: 'Wallet Connected',
              });
            }
          }
        }
      }
      else if(wallet_name="spireKey"){
          const account  = await connectAccount()
          const ready = await account.isReady()
          console.log(account)
          if(ready){
            await setAccount({ account: account.accountName, guard: null, balance: 0 });
            setKadenaWalletState({
              account: account.accountName,
              isInstalled: true,
              isConnected: true,
            });
          }
      }
    
    };
  
    const connectWallet = async () => {
      const connect = await kadenaExt.request({
        method: 'kda_connect',
        networkId: NETWORKID,
      });
      return connect;
    };
  
    const disconnectWallet = async () => {
      if (kadenaExt) {
        console.log('X-Wallet: SEND disconnect request');
        setKadenaWalletState({
          ...kadenaWalletState,
          account: null,
          isConnected: false,
        });
        await kadenaExt.request({
          method: 'kda_disconnect',
          networkId: NETWORKID,
        });
        logout();
        messageApi.open({
            type: 'success',
            content: 'Wallet Disconnected',
          });
      }
    };

    const logout = () => {
        removeAccount();
        localStorage.removeItem('signing', null);
        localStorage.removeItem('wallet');
      };
  
    const getNetworkInfo = async () => {
        if(kadenaWalletState.isInstalled){
            console.log('getNetworkInfo');
            const network = await kadenaExt.request({
              method: 'kda_getNetwork',
            });
            console.log('X-Wallet: SEND kda_getNetwork request', network);
            return network;
        }
        else{
            
            return null
        }
    
    };
  
    const checkStatus = async () => {
      console.log('X-Wallet: SEND kda_checkStatus request');
      await kadenaExt?.request({
        method: 'kda_checkStatus',
        networkId: NETWORKID,
      });
    };
  
    const getAccountInfo = async () => {
      const account = await kadenaExt.request({
        method: 'kda_requestAccount',
        networkId: NETWORKID,
      });
      console.log('X-Wallet: SEND kda_requestAccount request', account);
      return account;
    };
  
    const requestSign = async (signingCmd) => {
      const account = await getAccountInfo();
      if (account.status === 'fail') {
        alertDisconnect();
      } else {
        console.log('X-Wallet: SEND kda_requestSign request');
        return await kadenaExt.request({
          method: 'kda_requestSign',
          data: {
            networkId: NETWORKID,
            signingCmd,
          },
        });
      }
    };
  
    const setAccountData = async () => {
      console.log('X-Wallet: SETTING ACCOUNT DATA');
      const acc = await getAccountInfo();
      if (acc.wallet) {
        console.log('X-Wallet: SETTING ACCOUNT DATA - WALLET FOUNDED', acc);
        await setAccount({ account: acc.wallet.account, guard: null, balance: 0 });
        setKadenaWalletState({
          account: acc.wallet.account,
          isInstalled: true,
          isConnected: true,
        });
    
      } else if (kadenaWalletState.isConnected) {
        console.log('X-Wallet: SETTING ACCOUNT DATA - WALLET NOT FOUND CONNECTING');
        const connectRes = await connectWallet();
        if (connectRes.status === 'success') {
          await setAccountData();
        }
      } else {
        console.log('X-Wallet: SETTING ACCOUNT DATA - NOT CONNECTED');
      }
    };
  
    const alertDisconnect = () => {
      console.log('!!!DISCONNECTING');
      logout();
    };
  
    const onCheckStatusResponse = async (response) => {
      // I have to use local storage directly because of state is null on callback listener
      const localState = localStorage.getItem('kaddexWalletState') && JSON.parse(localStorage.getItem('kaddexWalletState'));
      if (localState?.isConnected && response?.result?.status === 'fail' && response?.result?.message === 'Not connected') {
        const connectRes = await connectWallet();
        if (connectRes.status === 'success') {
          await setAccountData();
        }
      }
    };
  
    const showNetworkError = () => {
     messageApi.open({type:"error", content:`Please change network to ${NETWORKID}`})
    };
  

  
    return (
      <KadenaWalletContext.Provider
        value={{
          ...kadenaWalletState,
          initializeKadenaWallet,
          disconnectWallet,
          requestSign,
          logout,
          messageApi
        }}
      >
        {contextHolder}
        {props.children}
      </KadenaWalletContext.Provider>
    );
  };
  
  export const KadenaWalletCunsomer = KadenaWalletContext.Consumer;
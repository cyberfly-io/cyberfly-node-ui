import React, { useState, createContext, useEffect, useCallback, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { NETWORKID} from '../constants/contextConstants'
import { message } from 'antd';

export const EckoWalletContext = createContext();
export const useEckoWalletContext = () => useContext(EckoWalletContext);


const NETWORK = "testnet04"

const initialEckoWalletState = {
    isConnected: false,
    isInstalled: false,
    NETWORK,
    account: null,
  };
  
  export const EckoWalletProvider = (props) => {
    const [messageApi, contextHolder] = message.useMessage();

    const [kadenaExt, setKadenaExt] = useState(null);
    const [account, setAccount, removeAccount] = useLocalStorage('acct', { account: null, guard: null, balance: 0 });
    const [eckoWalletState, setEckoWalletState] = useLocalStorage('kaddexWalletState', initialEckoWalletState);
    
    const initialize = useCallback(() => {
      const { kadena } = window;
      setKadenaExt(kadena);
      setEckoWalletState({
        ...eckoWalletState,
        isInstalled: Boolean(kadena?.isKadena),
      });
    }, [eckoWalletState]);
  
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
      if (kadenaExt && eckoWalletState.isConnected) {
        setAccountData();
      }
    }, [kadenaExt]);
  
    useEffect(() => {
      if (eckoWalletState.isConnected && (!account?.account)) {
        disconnectWallet();
      }
    }, [eckoWalletState, account]);
  
    /**
     * Used by ConnectModal
     */
    const initializeEckoWallet = async () => {
      console.log('!!!initializeKaddexWallet');
      const networkInfo = await getNetworkInfo();
      if (networkInfo==null){
        messageApi.warning("Please install eckowallet Extension")
      }
      else{
        console.log('networkInfo', networkInfo);
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
        setEckoWalletState({
          ...eckoWalletState,
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
        if(eckoWalletState.isInstalled){
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
        setEckoWalletState({
          account: acc.wallet.account,
          isInstalled: true,
          isConnected: true,
        });
    
      } else if (eckoWalletState.isConnected) {
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
      <EckoWalletContext.Provider
        value={{
          ...eckoWalletState,
          initializeEckoWallet,
          disconnectWallet,
          requestSign,
          logout,
          messageApi
        }}
      >
        {contextHolder}
        {props.children}
      </EckoWalletContext.Provider>
    );
  };
  
  export const EckoWalletCunsomer = EckoWalletContext.Consumer;
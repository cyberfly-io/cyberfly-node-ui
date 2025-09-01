import React, { useState, createContext, useEffect, useCallback, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { connect } from '@kadena/spirekey-sdk';
import { NETWORKID} from '../constants/contextConstants'
import { newRequest } from '../utils/utils';
import { Snackbar, Alert } from '@mui/material';

export const KadenaWalletContext = createContext();
export const useKadenaWalletContext = () => useContext(KadenaWalletContext);


const NETWORK = "mainnet01";

const initialKadenaWalletState = {
    isConnected: false,
    isInstalled: false,
    NETWORK,
    account: null,
  };
  
  export const KadenaWalletProvider = (props) => {
    const linx = (...args) => window.flutter_inappwebview.callHandler('LinxWallet', ...args)

    // Notification state
    const [notification, setNotification] = useState({
      open: false,
      message: '',
      severity: 'info' // 'success', 'error', 'warning', 'info'
    });

    const showNotification = (message, severity = 'info') => {
      setNotification({
        open: true,
        message,
        severity
      });
    };

    const hideNotification = () => {
      setNotification(prev => ({ ...prev, open: false }));
    };

    const [kadenaExt, setKadenaExt] = useState(null);
    const [account, setAccount, removeAccount] = useLocalStorage('acct', { account: null, guard: null, balance: 0 });
    const [kadenaWalletState, setKadenaWalletState] = useLocalStorage('KadenaWalletState', initialKadenaWalletState);
    
    const initialize = useCallback(() => {
      const { kadena } = window;
      console.log("kadena", kadena)
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
  
      if (kadenaExt && kadenaWalletState.isConnected) {
        //checkStatus();
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
  


    const connectAccount = async () => {
      try {
        const account = await connect('mainnet01', '1');
        // Wait for the account to be ready before proceeding
        await account.isReady();
        return account;
      } catch (error) {
        console.warn('User canceled sign-in', error);
      }
    };

    const initializeKadenaWallet = async (wallet_name) => {
      if (window.flutter_inappwebview) {
        const acc = await linx(newRequest('Account', 'get address', {}, false));
        await setAccount({ account: acc, guard: null, balance: 0 });
        setKadenaWalletState({
          account: acc,
          isInstalled: true,
          isConnected: true,
        });
      } else {
        if (wallet_name === "eckoWallet") {
          const networkInfo = await getNetworkInfo();
          console.log('Network Info:', networkInfo);
          if (networkInfo == null) {
            showNotification("Please install eckowallet Extension", "warning");
          } else {
            if (networkInfo.networkId !== NETWORKID) {
              showNetworkError();
            } else {
              const connectResponse = await connectWallet();
              console.log('connectResponse', connectResponse);
              if (connectResponse?.status === 'success') {
                await setAccountData();
                showNotification('Wallet Connected', 'success');
              }
            }
          }
        } else if (wallet_name === "spireKey") {
          const account = await connectAccount();
          const ready = await account.isReady();
          console.log(account);
          if (ready) {
            await setAccount({ account: account.accountName, guard: null, balance: 0 });
            setKadenaWalletState({
              account: account.accountName,
              isInstalled: true,
              isConnected: true,
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
        showNotification('Wallet Disconnected', 'success');
      }
      else if(window.flutter_inappwebview){
        setKadenaWalletState({
          ...kadenaWalletState,
          account: null,
          isConnected: false,
        });
        logout();
        showNotification('Wallet Disconnected', 'success');
      }
    };

    const logout = () => {
        removeAccount();
        localStorage.removeItem('signing', null);
        localStorage.removeItem('wallet');
      };
  
    const getNetworkInfo = async () => {
      try {
        const network = await kadenaExt?.request({
          method: 'kda_getNetwork',
        });
        console.log('X-Wallet: SEND kda_getNetwork request', network);
        if (!network) {
          console.error('Network info is null or undefined');
        }
        return network;
      } catch (error) {
        console.error('Error fetching network info:', error);
        return null;
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
     showNotification(`Please change network to ${NETWORKID}`, 'error');
    };
  

  
    return (
      <KadenaWalletContext.Provider
        value={{
          ...kadenaWalletState,
          initializeKadenaWallet,
          disconnectWallet,
          requestSign,
          logout,
          showNotification
        }}
      >
        {props.children}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={hideNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={hideNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </KadenaWalletContext.Provider>
    );
  };
  
  export const KadenaWalletCunsomer = KadenaWalletContext.Consumer;
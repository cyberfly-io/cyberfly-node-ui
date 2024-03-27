import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { EckoWalletProvider } from './contexts/eckoWalletContext';
import { Libp2pProvider } from './contexts/Libp2pContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
<DarkModeProvider>

  <EckoWalletProvider>
    <Libp2pProvider>
    <App />
    </Libp2pProvider>
    </EckoWalletProvider>


    </DarkModeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

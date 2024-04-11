export const CHAIN_ID = process.env.REACT_APP_KDA_CHAIN_ID || '1';
export const PRECISION = Number(process.env.REACT_APP_KDA_PRECISION) || 12;
export const NETWORKID = process.env.REACT_APP_KDA_NETWORK_ID || 'testnet04';
export const FEE = process.env.REACT_APP_KDA_FEE || 0.003;
export const APR_FEE = process.env.REACT_APP_APR_FEE || 0.0025;
export const GAS_PRICE = Number(process.env.REACT_APP_KDA_GAS_PRICE) || 0.0000001;
export const GAS_LIMIT = Number(process.env.REACT_APP_KDA_GAS_LIMIT) || 100000;
export const NETWORK_TYPE = process.env.REACT_APP_KDA_NETWORK_TYPE || 'testnet';
export const ENABLE_GAS_STATION = process.env.REACT_APP_ENABLE_GAS_STATION || false;
export const STAKING_REWARDS_PERCENT = process.env.REACT_APP_STAKING_REWARDS_PERCENT || 0.05;
export const NETWORK_VERSION = process.env.REACT_APP_KDA_NETWORK_VERSION || '0.0';


export const NETWORK = `${process.env.REACT_APP_KDA_NETWORK}/chainweb/${NETWORK_VERSION}/${NETWORKID}/chain/${CHAIN_ID}/pact`  || "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact";

export const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

export const isMainnet = () => NETWORK_TYPE === 'mainnet';

export const bootStrapNode = "/dns4/node.cyberfly.io/tcp/443/wss/p2p/QmVydtrKsPcLdscLP9YMSynmc7GCNA7ZeUE9ViALuWijqV"
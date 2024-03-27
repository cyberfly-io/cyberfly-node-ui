import React, { createContext, useState, useContext } from 'react';

const Libp2pContext = createContext();

export const useLibp2p = () => useContext(Libp2pContext);

export const Libp2pProvider = ({ children }) => {
  const [libp2pState, setLibp2pState] = useState(null);
  const [topics, setTopics] = useState([]);


  return (
    <Libp2pContext.Provider value={{ libp2pState, setLibp2pState, topics, setTopics }}>
      {children}
    </Libp2pContext.Provider>
  );
};
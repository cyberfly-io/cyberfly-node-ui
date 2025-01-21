export const getIPFromMultiAddr = (addr) => {
    const regex = /\/ip4\/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/;
    const match = addr.match(regex);
    return 'http://' + match[1] + ":31000";
  };
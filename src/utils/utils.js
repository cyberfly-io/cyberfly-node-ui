export const getIPFromMultiAddr = (addr) => {
    if(addr){
      const regex = /\/ip4\/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/;
    const match = addr.match(regex);
    if(match)
    return 'http://' + match[1] + ":31000";
    }
  };


  export const newRequest = function (
    request,
    description,
    requestData,
    needsApproval
  ) {
    return {
      request: request, // Example: "Buy"
      description: description, // Example: "Wizard #1477"
      data: requestData,
      needsApproval: needsApproval // Example true
    }
  }
  
  export const requestData = function (
    signingRequest,
    itemDescription,
    imageUrl,
    chainId,
    tokenId,
    amount,
    dappFee,
    feeTokenId,
    chainless
  ) {
    return {
      signingRequest: signingRequest,
      itemDescription: itemDescription,
      imageUrl: imageUrl,
      chainId: chainId,
      tokenId: tokenId,
      amount: amount,
      dappFee: dappFee,
      feeTokenId: feeTokenId,
      chainless: chainless
    }
  }
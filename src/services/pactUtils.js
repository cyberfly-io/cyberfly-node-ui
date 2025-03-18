const creationTime = () => Math.round(new Date().getTime() / 1000)

export const stakeRequest = (account, peerId)=> {
    const signingRequest = {
      code: `(free.cyberfly_node.stake "${account}" "${peerId}")`,
      caps: [
        {
            role: 'pay gas',
            description: 'pay for gas',
            cap: {
               name: 'free.cyberfly-account-gas-station.GAS_PAYER',
              args: ['cyberfly-account-gas', { int: 1 }, 1.0]
            }
          },
        {
          role: `account auth`,
          description: `Account auth for node stake`,
          cap: {
            args: [
              account
            ],
            name: `free.cyberfly_node.ACCOUNT_AUTH`
          }
        },
        {
            role: `node guard`,
            description: `Node guard for node stake`,
            cap: {
              args: [
                peerId
              ],
              name: `free.cyberfly_node.NODE_GUARD`
            }
          },
          {
            role: `transfer CFLY`,
            description: `Transfer CFLY for node stake`,
            cap: {
              args: [
                account, 'cyberfly-staking-bank', 50000.0
              ],
              name: `free.cyberfly_token.TRANSFER`
            }
          },
      ],
      nonce: creationTime().toString(),
      chainId: '1',
      gasPrice: 0.0000001,
      gasLimit: 2000,
      ttl: 600,
      sender: 'cyberfly-account-gas',
      extraSigners: []
    }
    return signingRequest
  }


  export const unStakeRequest = (account, peerId)=> {
    const signingRequest = {
      code: `(free.cyberfly_node.unstake "${account}" "${peerId}")`,
      caps: [
        {
          role: 'pay gas',
          description: 'pay for gas',
          cap: {
            name: 'coin.GAS',
            args: []
          }
        },
        {
          role: `account auth`,
          description: `Account auth for node stake`,
          cap: {
            args: [
              account
            ],
            name: `free.cyberfly_node.ACCOUNT_AUTH`
          }
        }
      ],
      nonce: creationTime().toString(),
      chainId: '1',
      gasPrice: 0.0000001,
      gasLimit: 2000,
      ttl: 600,
      sender: account,
      extraSigners: []
    }
    return signingRequest
  }


  export const claimRequest = (account, peerId)=> {
    const signingRequest = {
      code: `(free.cyberfly_node.claim-reward "${account}" "${peerId}")`,
      caps: [
        {
          role: 'pay gas',
          description: 'pay for gas',
          cap: {
             name: 'free.cyberfly-account-gas-station.GAS_PAYER',
            args: ['cyberfly-account-gas', { int: 1 }, 1.0]
          }
        },
        {
          role: `account auth`,
          description: `Account auth for reward claim`,
          cap: {
            args: [
              peerId
            ],
            name: `free.cyberfly_node.NODE_GUARD`
          }
        }
      ],
      nonce: creationTime().toString(),
      chainId: '1',
      gasPrice: 0.0000001,
      gasLimit: 2000,
      ttl: 600,
      sender: 'cyberfly-account-gas',
      extraSigners: []
    }
    return signingRequest
  }

  export async function sendTransaction(tx) {

    try {
      const res = await fetch(
        `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/1/pact/api/v1/send`,
  
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cmds: [tx] })
        }
      )
      if (res.status === 200) {
        return await res.json()
      } else {
        const message = await res.text()
        alert(`Error sending transaction: ${message}`)
      }
    } catch (error) {
      alert(`Error sending transaction: ${error}`)
    }
  }
  

  export async function getLocalResultForTransaction(tx) {
    const res = await fetch(
      `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/1/pact/api/v1/local`,
  
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tx)
      }
    )
    const result = await res.json()
    return result
  }
import { PageContainer } from '@ant-design/pro-components'
import React, { useEffect, useState } from 'react'
import { claimFaucet, getNode } from '../services/pact-services'
import { getNodeInfo } from '../services/node-services'
import { Button, Result } from 'antd'
import {WalletOutlined} from "@ant-design/icons"
import { useEckoWalletContext } from '../contexts/eckoWalletContext';

const Faucet = () => {

  const {initializeEckoWallet, account  } = useEckoWalletContext()


  return (
    <PageContainer title="Testnet Faucet">

{ !account? (  <Result
    icon={<WalletOutlined />}
    title="Please connect your kadena wallet to claim testnet CFLY tokens"
    extra={<Button type="primary" onClick={initializeEckoWallet}>Connect</Button>}
  />):(<Button onClick={()=>{
    claimFaucet(account).then(data=>{
      console.log(data)
    })
   }} type='primary'>Claim 50000CFLY</Button>) }

       
    </PageContainer>
  )
}

export default Faucet
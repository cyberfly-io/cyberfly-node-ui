import { PageContainer } from '@ant-design/pro-components'
import React, { useState } from 'react'
import { claimCreateFaucet, claimFaucet, returnFaucet } from '../services/pact-services'
import { Button, Result, Segmented, Row, Col, Space } from 'antd'
import {WalletOutlined, PlusCircleOutlined, MoneyCollectOutlined, UndoOutlined} from "@ant-design/icons"
import { useKadenaWalletContext } from '../contexts/kadenaWalletContext';

const Faucet = () => {
  const {initializeKadenaWallet, account  } = useKadenaWalletContext()
  const [old, setOld] = useState(false)
  const [rtrn, setRtrn] = useState(true)



  return (
    <PageContainer title="Testnet Faucet">
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>

<Row>
  <Col>
  { !account? (  <Result
    icon={<WalletOutlined />}
    title="Please connect your kadena wallet to claim testnet CFLY tokens"
    extra={<Button type="primary" onClick={()=>initializeKadenaWallet("eckoWallet")}>Connect</Button>}
  />):(<Button onClick={()=>{
  if(old){
    claimFaucet(account).then(data=>{
      console.log(data)
    })
  }
  else if(!old && !rtrn){
    claimCreateFaucet(account).then(data=>{
      console.log(data)
    })
  }
  else{
    returnFaucet(account).then(data=>{
      console.log(data)
    })
  }
   }} type='primary'>{rtrn? "Return":"Claim"} 50000CFLY</Button>) }
  </Col>
</Row>


  </Space>
    </PageContainer>
  )
}

export default Faucet
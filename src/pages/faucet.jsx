import { PageContainer } from '@ant-design/pro-components'
import React, { useState } from 'react'
import { claimCreateFaucet, claimFaucet } from '../services/pact-services'
import { Button, Result, Segmented, Row, Col, Space } from 'antd'
import {WalletOutlined, PlusCircleOutlined, MoneyCollectOutlined} from "@ant-design/icons"
import { useEckoWalletContext } from '../contexts/eckoWalletContext';

const Faucet = () => {
  const {initializeEckoWallet, account  } = useEckoWalletContext()
  const [old, setOld] = useState(false)


  return (
    <PageContainer title="Testnet Faucet">
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>

  {account && (    <Row>
      <Col>
      <Segmented
      defaultValue="new"
      onChange={(v)=>{
        if(v==="old"){
          setOld(true)
        }
        else{
          setOld(false)
        }
      }}
    options={[
      { label: 'New Account', value: 'new', icon: <PlusCircleOutlined /> },
      { label: 'Existing Account', value: 'old', icon: <MoneyCollectOutlined />},
    ]}
  />
      </Col>
      </Row>)}

<Row>
  <Col>
  { !account? (  <Result
    icon={<WalletOutlined />}
    title="Please connect your kadena wallet to claim testnet CFLY tokens"
    extra={<Button type="primary" onClick={initializeEckoWallet}>Connect</Button>}
  />):(<Button onClick={()=>{
  if(old){
    claimFaucet(account).then(data=>{
      console.log(data)
    })
  }
  else{
    claimCreateFaucet(account).then(data=>{
      console.log(data)
    })
  }
   }} type='primary'>Claim 50000CFLY</Button>) }
  </Col>
</Row>


  </Space>
    </PageContainer>
  )
}

export default Faucet
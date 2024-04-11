import { Col, Row,Divider, List,Collapse, Modal, Button } from 'antd'
import { GridContent } from '@ant-design/pro-components';

import React, {useEffect, useState} from 'react'
import { getNodeInfo, getPeers } from '../services/node-services'
import { StatisticCard, PageContainer } from '@ant-design/pro-components';
import {ApartmentOutlined, InfoCircleOutlined, DeploymentUnitOutlined} from '@ant-design/icons'
import { useLibp2p } from '../contexts/Libp2pContext';
import { getNode, registerNode } from '../services/pact-services';
import { useEckoWalletContext } from '../contexts/eckoWalletContext';
import KeyValueTable from './KeyValueTable';



const MainContent = () => {
const [peers, setPeers] = useState([])
const [peerItems, setPeerItems] = useState([])
const [cCount, setCCount] = useState(0)
const [dCount, setDCount] = useState(0)
const [connected, setConnected] = useState(false);
const [loading, setLoading] = useState(true);
const [nodeInfo, setNodeInfo] = useState(null)
const [tableData, setTableData] = useState({})
const {libp2pState} = useLibp2p()
const [open, setOpen] = useState(false);
const [confirmLoading, setConfirmLoading] = useState(false);
const {initializeEckoWallet, account  } = useEckoWalletContext()
const [submitted, setSubmitted] = useState(false)

  useEffect(()=>{
 function getInfo (){
  getPeers().then((data)=>{
      setPeers(data)
    setLoading(false)
  })
  getNodeInfo().then((data)=>{
     setNodeInfo(data)
     setCCount(data.connected)
     setDCount(data.discovered)
     setTableData({peerId:data.peerId, multiAddr:data.multiAddr, publicKey:data.publicKey})
  })
 }
 getInfo()
    
 },[])

 useEffect(()=>{
     if(nodeInfo){
      getNode(nodeInfo.peerId).then((data)=>{
        if(data.result.status==="failure" && data.result.error.message.includes("row not found") && !submitted){
          setOpen(true)
        }
      })
     }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[nodeInfo])

 useEffect(()=>{
  if(peers && libp2pState){
    const items = peers.map((item) => ({
      key: item.remotePeer,
      label: item.remotePeer===libp2pState.peerId.toString()? item.remotePeer+' - This browser tab':item.remotePeer,
      children: (
        <List
        bordered
          itemLayout="horizontal"
        header={<>Multi Address</>}
        >
 <List.Item>
              <List.Item.Meta
                title={item.remoteAddr}
              />
            </List.Item>

        </List>
      ),
    }));
    setPeerItems(items)
    setConnected(true)
  }
  
 },
 // eslint-disable-next-line
 [connected])

 const handleOk = () => {
  setConfirmLoading(true);
  setSubmitted(true)
  registerNode(nodeInfo.peerId, nodeInfo.multiAddr,account ,nodeInfo.publicKey).then((data)=>{
    console.log(data)
    setConfirmLoading(false);
    setOpen(false);
  })

};
const handleCancel = () => { 
  setOpen(false);
  setSubmitted(true)
};
  return (
    <PageContainer title="Dashboard">
    <GridContent>
  
    <Row
          gutter={24}
          style={{
            marginTop: 24,
          }}
        >
          
                    <Col xl={12} lg={24} md={24} sm={24} xs={24}>

  <StatisticCard
        bordered={true}
        boxShadow
          statistic={{
            title: 'Node Peer Id',
            value: nodeInfo?.peerId,
            valueStyle: {fontSize:16},
            icon:(<DeploymentUnitOutlined />)
          }}
      
        />
        </Col>
        <Col xl={12} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 15 }}>  

        <StatisticCard
          bordered={true}
          boxShadow
          statistic={{
            title: 'Node Version',
            value: nodeInfo?.version,
            icon: (
              <InfoCircleOutlined />
            )
          }}
     
        />
        </Col>
       
        <Col xl={12} lg={24} md={24} sm={24} xs={24}>
<StatisticCard
      bordered={true}
      boxShadow
      statistic={{
     
        loading:loading,
        title: 'Discovered',
        status:'processing',
        value: dCount,
        description:"peers",
        icon: (
<ApartmentOutlined />),
      }}

      />
      </Col>
   <Col xl={12} lg={24} md={24} sm={24} xs={24}>
  <StatisticCard
      bordered={true}
      boxShadow
      statistic={{
     
        loading:loading,
        title: 'Connected',
        status:'success',
        value: cCount,
        description:"peers",
        icon: (
<ApartmentOutlined />        ),
      }}

      />
</Col>
</Row>



<Divider orientation="left">Connected Peers</Divider>
<Collapse items={peerItems} />
<Modal
        title="Register Node to get reward"
        open={open && !submitted}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText="Register"
        cancelText="Cancel"
        width={800}
        okButtonProps={{ style: { display: account? '':'none' } }}
      >
        {!account && (<Button style={{float:"right"}} type='primary' onClick={initializeEckoWallet}>Connect Wallet</Button>)}
        <KeyValueTable data={tableData} />
      </Modal>
      </GridContent>
</PageContainer>
  )
}

export default MainContent

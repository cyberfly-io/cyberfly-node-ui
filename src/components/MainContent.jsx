import { Col, Row,Divider,Typography,Collapse, Modal, Button, Spin } from 'antd'
import { GridContent } from '@ant-design/pro-components';
import React, {useEffect, useState} from 'react'
import { getNodeInfo } from '../services/node-services'
import { StatisticCard, PageContainer } from '@ant-design/pro-components';
import {ApartmentOutlined, InfoCircleOutlined, DeploymentUnitOutlined} from '@ant-design/icons'
import { getNode, registerNode } from '../services/pact-services';
import { useEckoWalletContext } from '../contexts/eckoWalletContext';
import KeyValueTable from './KeyValueTable';

const { Paragraph } = Typography;


const MainContent = () => {
const [peers, setPeers] = useState([])
const [peerItems, setPeerItems] = useState([])
const [cCount, setCCount] = useState(0)
const [dCount, setDCount] = useState(0)
const [loading, setLoading] = useState(true);
const [nodeInfo, setNodeInfo] = useState(null)
const [tableData, setTableData] = useState({})
const [open, setOpen] = useState(false);
const [confirmLoading, setConfirmLoading] = useState(false);
const {initializeEckoWallet, account  } = useEckoWalletContext()
const [submitted, setSubmitted] = useState(false)

  useEffect(()=>{
 function getInfo (){
  getNodeInfo().then((data)=>{
     setNodeInfo(data)
     setCCount(data.connected)
     setDCount(data.discovered)
     setTableData({peerId:data.peerId, multiAddr:data.multiAddr, publicKey:data.publicKey})
     setPeers(data.peers)
     setLoading(false)
  })
 }
 getInfo()
 const intervalId = setInterval(getInfo, 5000);
 return ()=>clearInterval(intervalId)
 },[])

 useEffect(()=>{
     if(nodeInfo){
      getNode(nodeInfo.peerId).then((data)=>{
        if(data.result.status==="failure" && data.result.error.message.includes("row not found") && !submitted){
          
        }
      })
     }
 // eslint-disable-next-line
 },[nodeInfo])

 useEffect(()=>{
  if(peers){
    const items = peers.map((item) => ({
      key: item,
      label:   <Paragraph  copyable={{tooltips:['Copy', 'Copied']}}>{item}</Paragraph>,
    }));
    setPeerItems(items)
  }
  
 },
 // eslint-disable-next-line
 [peers])

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
      
      <Spin spinning={loading} tip="Loading" fullscreen size='large'/>
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
            loading:loading,

            value: nodeInfo?.peerId,
            valueStyle: {fontSize:14},
            icon:(<DeploymentUnitOutlined />)
          }}
      
        />
        </Col>
        <Col xl={12} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 15 }}>  

        <StatisticCard
          bordered={true}
          boxShadow
          statistic={{
            loading:loading,

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
<Collapse items={peerItems} collapsible="icon"/>
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

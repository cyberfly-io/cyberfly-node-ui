import { Flex,Divider, List,Collapse, Modal, Button } from 'antd'
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
const {signal, libp2pState} = useLibp2p()
const [open, setOpen] = useState(false);
const [confirmLoading, setConfirmLoading] = useState(false);
const {initializeEckoWallet, account  } = useEckoWalletContext()
const [submitted, setSubmitted] = useState(false)

  useEffect(()=>{
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

    
 }, [signal])

 useEffect(()=>{
     if(nodeInfo){
      getNode(nodeInfo.peerId).then((data)=>{
        if(data.result.status==="failure" && data.result.error.message.includes("row not found") && !submitted){
          setOpen(true)
        }
      })
     }
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
 [peers, connected])

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
};
  return (
    <PageContainer title="Dashboard">
    <Flex gap="middle" vertical={false}>
  
  
  <StatisticCard
        bordered={true}
        boxShadow
          statistic={{
            title: 'Node Peer Id',
            value: nodeInfo?.peerId,
            valueStyle: {fontSize:15},
            icon:(<DeploymentUnitOutlined />)
          }}
      
        />
      
    
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
<ApartmentOutlined />        ),
      }}

      />
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




</Flex>
<Divider orientation="left">Connected Peers</Divider>
<Collapse items={peerItems} />
<Modal
        title="Register Node to get reward"
        open={open}
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
</PageContainer>
  )
}

export default MainContent

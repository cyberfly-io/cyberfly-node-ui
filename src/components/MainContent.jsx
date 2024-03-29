import { Flex,Divider, List,Collapse } from 'antd'
import React, {useEffect, useState} from 'react'
import { getNodeInfo, getPeers } from '../services/node-services'
import { StatisticCard, PageContainer } from '@ant-design/pro-components';
import {ApartmentOutlined, InfoCircleOutlined, DeploymentUnitOutlined} from '@ant-design/icons'
import { useLibp2p } from '../contexts/Libp2pContext';



const MainContent = () => {
const [peers, setPeers] = useState([])
const [peerItems, setPeerItems] = useState([])
const [cCount, setCCount] = useState(0)
const [dCount, setDCount] = useState(0)
const [connected, setConnected] = useState(false);
const [loading, setLoading] = useState(true);
const [nodeInfo, setNodeInfo] = useState(null)
const {signal} = useLibp2p()


  useEffect(()=>{
    getPeers().then((data)=>{
      setPeers(data)
      setLoading(false)
    })
    getNodeInfo().then((data)=>{
       setNodeInfo(data)
       setCCount(data.connected)
       setDCount(data.discovered)
    })
    
 }, [signal])

 useEffect(()=>{
  if(peers){
    const items = peers.map((item) => ({
      key: item.remotePeer,
      label: item.remotePeer,
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
  
 },[peers, connected])


  return (
    <PageContainer title="Dashboard" tabList={[
      {
        tab: 'Node Info',
        key: 'node',
      },
      {
        tab: 'Browser Node Info',
        key: 'browser',
      },
    ]} onTabChange={()=>console.log("tab changed")}>
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
</PageContainer>
  )
}

export default MainContent

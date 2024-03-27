import { Flex,Divider, List,Collapse } from 'antd'
import React, {useEffect, useState} from 'react'
import { getNodeInfo, getPeers } from '../services/node-services'
import { StatisticCard, PageContainer } from '@ant-design/pro-components';
import {ApartmentOutlined, InfoCircleOutlined, DeploymentUnitOutlined} from '@ant-design/icons'



const MainContent = () => {
const [peers, setPeers] = useState([])
const [peerItems, setPeerItems] = useState([])
const [cCount, setCCount] = useState(0)
const [dCount, setDCount] = useState(0)
const [connected, setConnected] = useState(false);
const [loading, setLoading] = useState(true);
const [nodeInfo, setNodeInfo] = useState(null)

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
    
 }, [])

 useEffect(()=>{
  if(peers){
    const items = peers.map((item) => ({
      key: item.id,
      label: item.id,
      children: (
        <List
        bordered
          itemLayout="horizontal"
          dataSource={item.addresses}
          renderItem={(address) => (
            <List.Item>
              <List.Item.Meta
                title={address.multiaddr}
              />
            </List.Item>
          )}
        />
      ),
    }));
    setPeerItems(items)
    setConnected(true)
  }
  
 },[peers, connected])


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
<Divider orientation="left">Discovered Peers</Divider>
<Collapse items={peerItems} />
</PageContainer>
  )
}

export default MainContent

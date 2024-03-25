import { Flex, } from 'antd'
import React, {useEffect, useState} from 'react'
import { getNodeInfo, getPeers } from '../services/node-services'
import { StatisticCard, PageContainer } from '@ant-design/pro-components';
import {ApartmentOutlined, InfoCircleOutlined, DeploymentUnitOutlined} from '@ant-design/icons'



const MainContent = () => {
const [peers, setPeers] = useState([])
const [peerCount, setPeerCount] = useState(0)

const [connected, setConnected] = useState(false);
const [loading, setLoading] = useState(true);
const [nodeInfo, setNodeInfo] = useState(null)

  useEffect(()=>{
    getPeers().then((data)=>{setPeers(data)
      setPeerCount(data.length)
      setLoading(false)
     
    })
    getNodeInfo().then((data)=>{
       setNodeInfo(data)
    })
    
 }, [])

 useEffect(()=>{
  if(peers.length>0){
    setConnected(true)
    console.log(connected)
  }
 },[peers, connected])

  return (
    <PageContainer title="Dashboard">
    <Flex gap="middle" vertical={false} >
  
  
  <StatisticCard
        bordered={true}
        boxShadow
          statistic={{
            title: 'Peer Id',
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
        title: 'Connected',
        status:'success',
        value: peerCount,
        description:"peers",
        icon: (
<ApartmentOutlined />        ),
      }}

      />


 


</Flex>

</PageContainer>
  )
}

export default MainContent

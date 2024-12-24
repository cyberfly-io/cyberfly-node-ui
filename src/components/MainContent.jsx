import { Col, Row,Divider,Typography,Collapse, Modal, Button, Spin } from 'antd'
import { GridContent } from '@ant-design/pro-components';
import React, {useEffect, useState} from 'react'
import { getNodeInfo } from '../services/node-services'
import { StatisticCard, PageContainer } from '@ant-design/pro-components';
import {ApartmentOutlined, InfoCircleOutlined, DeploymentUnitOutlined, RadarChartOutlined} from '@ant-design/icons'
import { getActiveNodes, getStakeStats } from '../services/pact-services';

const { Paragraph } = Typography;


const MainContent = () => {
const [peers, setPeers] = useState([])
const [peerItems, setPeerItems] = useState([])
const [cCount, setCCount] = useState(0)
const [dCount, setDCount] = useState(0)
const [loading, setLoading] = useState(true);
const [version, setVersion] = useState()
const [nodeInfo, setNodeInfo] = useState(null)
const [activeNodes, setActiveNodes] = useState(0)
const [locked, setLocked] = useState(0)
const [stakes, setStakes] = useState(0)


  useEffect(()=>{
 function getInfo (){
  getNodeInfo().then((data)=>{
     setNodeInfo(data)
     setCCount(data.connected)
     setDCount(data.discovered)
     setVersion(data.version)
     setPeers(data.connections)
  })
  getActiveNodes().then((data)=>{
    setActiveNodes(data.length)
  })
  getStakeStats().then((data)=>{
    console.log(data)
    setStakes(data['total-stakes']['int'])
    setLocked(data['total-staked-amount'])
    setLoading(false)
  })
 }
 getInfo()
 const intervalId = setInterval(getInfo, 5000);
 return ()=>clearInterval(intervalId)
 },[])


 useEffect(()=>{
  if(peers){
    const items = peers.map((item) => ({
      key: item.remotePeer,
      label:   <Paragraph  copyable={{tooltips:['Copy', 'Copied']}}>{item.remotePeer}</Paragraph>,
      children: <><Paragraph  copyable={{tooltips:['Copy', 'Copied']}}>{item.remoteAddr}</Paragraph></>,
    }));
    setPeerItems(items)
  }
  
 },
 // eslint-disable-next-line
 [peers])


 const getIP = (addr)=>{
  const regex = /\/ip4\/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/;
  const match = addr.match(regex);
  return 'http://'+match[1]+":31000"
 }

  return (
    <PageContainer ghost loading={{spinning: loading,}} header={{title:"Dashboard", }} tabBarExtraContent={ version? `Node version ${version}`:''} >
      
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
            valueStyle: {fontSize:12},
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

            title: 'Node Owner',
            value: nodeInfo?.account,
            valueStyle: {fontSize:11},
            icon: (
              <InfoCircleOutlined />
            )
          }}
     
        />
        </Col>
       
        <Col >
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
   <Col >
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
<Col >
  <StatisticCard
      bordered={true}
      boxShadow
      statistic={{
     
        loading:loading,
        title: 'Active',
        status:'processing',
        value: activeNodes,
        description:"nodes",
        icon: (
<RadarChartOutlined />        ),
      }}

      />
</Col>
<Col >
  <StatisticCard
      bordered={true}
      boxShadow
      statistic={{
     
        loading:loading,
        title: 'Stakes',
        status:'processing',
        value: stakes,
        description:"nodes",
        icon: (
<RadarChartOutlined />        ),
      }}

      />
</Col>
<Col >
  <StatisticCard
      bordered={true}
      boxShadow
      statistic={{
     
        loading:loading,
        title: 'Locked Supply',
        status:'processing',
        value: locked,
        description:"CFLY",
        icon: (
<RadarChartOutlined />        ),
      }}

      />
</Col>
</Row>




<Divider orientation="left">Connected Peers</Divider>
<Collapse items={peerItems} collapsible="icon"/>
      </GridContent>
</PageContainer>
  )
}

export default MainContent

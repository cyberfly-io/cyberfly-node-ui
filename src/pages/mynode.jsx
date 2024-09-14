import { PageContainer } from '@ant-design/pro-components'
import React, { useEffect, useState } from 'react'
import { getMyNodes, getNodeStake, getNodeClaimable, nodeStake, nodeUnStake, claimReward } from '../services/pact-services'
import { Table, Spin, Result, Button, Tooltip, Modal, Col, Row, Statistic, Card, message as msg } from 'antd';
import { useEckoWalletContext } from '../contexts/eckoWalletContext';
import {WalletOutlined, EyeOutlined} from "@ant-design/icons"
import KeyValueTable from '../components/KeyValueTable';
const { Countdown } = Statistic;

const MyNode = () => {
  const [mynodes, setMyNodes] = useState([])
  const [messageApi, contextHolder] = msg.useMessage();

  const [loading, setLoading] = useState(true)
  const {initializeEckoWallet, account  } = useEckoWalletContext()
  const [node, setNode] = useState({})
  const [stake, setStake] = useState(null)
  const [claimable, setClaimable] = useState(0)
  const [deadline, setDeadline] = useState(Date.now());
  const [canStake, setCanStake] = useState(true)


  const [open, setOpen] = useState(false)
  const [loadingModal, setLoadingModal] = useState(true)



  const columns = [
    {
      title: 'Peer',
      dataIndex: 'peer_id',
      key: 'peer',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      defaultFilteredValue: ['active'],
      filters: [
        {
          text: 'Active',
          value: 'active',
        },
        {
          text: 'In Active',
          value: 'inactive',
        },
      ],
      onFilter: (value, record) => record.status.startsWith(value),
      width: '40%',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Tooltip title="View">
          <Button
            shape="round"
            onClick={() => {
              setOpen(false)
              loadData(record.peer_id)
            }}
            type="primary"
            icon={<EyeOutlined />}
          />
          </Tooltip>
      ),
    },
  ];
   
  useEffect(()=>{
if(account){
  setLoading(true)
  getMyNodes(account).then((data)=>{
    setMyNodes(data)
    setLoading(false)
   })
}
else{
  setLoading(false)
}
  },[account])


  const loadData = (peer_id)=>{
    setCanStake(true)
    setStake(null)
    setLoadingModal(true)
    const node_info = getNode(peer_id)
    getNodeStake(peer_id).then((data)=>{
      if(data){
        if(data.active)
        setCanStake(false)
        setStake(data)
        const originalDate = new Date(data.last_claim.timep);
        const nextDay = new Date(originalDate);
              nextDay.setDate(originalDate.getDate() + 1);
              setDeadline(nextDay)
      }
      getNodeClaimable(peer_id).then((reward)=>{
        if(reward)
          setClaimable(reward.reward)

      })
      setLoadingModal(false)
    })
    if(node_info)
      delete node_info['guard']
    setNode(node_info)
    setOpen(true)
  }


  const getNode = (peer_id)=>{
    console.log(peer_id)
    const filtered =  mynodes.filter(item => item.peer_id===peer_id)
    console.log(filtered)
       return filtered[0]
  }



  return (
    <PageContainer title="My Node">
      {contextHolder}
            <Spin spinning={loading} tip="Loading" fullscreen size='large'/>

{mynodes.length >0 && account && ( <Table
      columns={columns}
      dataSource={mynodes}
      rowKey="peer"
      
    />)}
  
  { !account && (  <Result
    icon={<WalletOutlined />}
    title="Please connect your kadena wallet to see your node details"
    extra={<Button type="primary" onClick={initializeEckoWallet}>Connect</Button>}
  />) }
  <Modal
        title={<p>Node Info and Stake</p>}
        footer={
         <Button type='primary' onClick={()=>{
          loadData(node.peer_id)
         }}>Refresh</Button>
        }
        loading={loadingModal}
        open={open}
        onCancel={() => setOpen(false)}
        width="80%"
        destroyOnClose={true}
      >
       <KeyValueTable data={node}></KeyValueTable>
   {stake && (    <Row gutter={16}>
    <Col span={6}>
    <Card bordered={false}>
      <Statistic title="Staked Amount" value={stake.amount} suffix="CFLY" />
      </Card>
    </Col>
    <Col span={6}>
    <Card bordered={false}>

      <Statistic title="Claimable" value={claimable} precision={2} suffix="CFLY" />
   {claimable>0 && stake.active && (   <Button type='primary' style={{ marginTop: 16 }} onClick={()=>{
      claimReward(node.account, node.peer_id, claimable).then(data=>{
        
      })
    }} >
        Claim
    </Button>) }
      </Card>
    </Col>
    <Col span={6}>
    <Card bordered={false}>

      <Statistic title="Staking Status" value={stake.active? "Active":"Inactive"} />
      </Card>
    </Col>
    <Col span={6}>
    <Card bordered={false} >

      <Statistic title="Claimed" value={stake.claimed} suffix="CFLY" />
      </Card>
    </Col>
    <Col span={6}>
    <Card bordered={false} >

      <Statistic title="Earning Status" value={node.status==="active"? "Earning":"Not Earning"} />
      </Card>
    </Col>
 {!claimable>0 && stake.active && node.status === "active" && (   <Col span={6}>
    <Card bordered={false} >

    <Countdown title="Next Claim" value={deadline}  />
    </Card>
    </Col>) }
  </Row>)}
  <Row gutter={16}>
  <Col span={12}>
  {canStake ? ( <Button style={{ marginTop: 50, marginLeft:500 }} type="primary" onClick={()=>{
    nodeStake(node.account, node.peer_id).then(data=>{
      if(data){
        messageApi.info({content:"Submitted, Please wait a while"})
        setOpen(false)
      }
    })
  }}>
        Stake
      </Button>):( <Button style={{ marginTop: 50, marginLeft:500 }} type="primary" onClick={()=>{
        nodeUnStake(node.account, node.peer_id).then(data=>{
          if(data){
            messageApi.info({content:"Submitted, Please wait a while"})
            setOpen(false)
          }
        })
      }}>
        Unstake
      </Button>)}
   </Col>

  </Row>

      </Modal>
    </PageContainer>
  )
}

export default MyNode
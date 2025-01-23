import { PageContainer } from "@ant-design/pro-components";
import { useState, useEffect } from "react";
import { getNodeStake, getNode, getNodeClaimable, getAPY, claimReward, nodeStake, nodeUnStake } from "../services/pact-services";
import { Button, Card, Col, Row, Tag, message as msg } from "antd";
import { Space } from "antd";
import { Typography } from "antd";
import ReactJson from "react-json-view";
import { useDarkMode } from '../contexts/DarkModeContext';
import { Statistic } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import {  useParams } from 'react-router-dom';
import { useKadenaWalletContext } from "../contexts/kadenaWalletContext";
const { Countdown } = Statistic;

const { Text } = Typography;
const NodeDetail = () => {
  const { account  } = useKadenaWalletContext()
  const [messageApi, contextHolder] = msg.useMessage();

    const [nodeInfo, setNodeInfo] = useState(null);
    const [claimable, setClaimable] = useState(null);
    const [apy, setApy] = useState(null);
    const [nodeStakeInfo, setNodeStakeInfo] = useState(null);
    const [canStake, setCanStake] = useState(true)
    const [deadline, setDeadline] = useState(Date.now());
  
    const { isDarkMode } = useDarkMode();
    const {peerId} = useParams()

    useEffect(() => {
        if (peerId) {
            getNode(peerId).then((data) => {
              setNodeInfo(data);
                console.log(nodeInfo)
                getNodeStake(peerId).then((data) => {
                    setNodeStakeInfo(data);
                    if(data.active)
                      setCanStake(false)
                    const originalDate = new Date(data.last_claim.timep);
                    const nextDay = new Date(originalDate);
                          nextDay.setDate(originalDate.getDate() + 1);
                          setDeadline(nextDay)
                });
            });

               getNodeClaimable(peerId).then((reward)=>{
                    if(reward)
                      setClaimable(reward.reward)
            
                  })
                      getAPY().then((data)=>{
                          setApy(data)
                        })
        }
    }, [peerId]);
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString();
    };
    return (  
        <PageContainer title="Node" loading={!nodeInfo}>
          {contextHolder}
          {nodeInfo && (
            <Card title="Account">
   <Text copyable style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {nodeInfo.account}
            </Text>
            </Card>
          )}
           {nodeStakeInfo && (
      <Card 
      title="Staking Information" 
      style={{ maxWidth: 800 }}
      extra={
        <>
     <Tag color="processing" icon={<DollarOutlined />}>
      APY {apy}%
     </Tag>
        <Tag color={nodeStakeInfo.active ? 'success' : 'error'} icon={nodeStakeInfo.active ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
          {nodeStakeInfo.active ? 'Stake Active' : 'Stake Inactive'}
        </Tag>
        </>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        <Row gutter={[24, 24]}>
          <Col xs={12} sm={8}>
            <Statistic
              title="Amount Staked"
              value={nodeStakeInfo.amount}
              precision={2}
              suffix="CFLY"
            />
          </Col>
          <Col xs={12} sm={8}>
            <Statistic
              title="Claimed Rewards"
              value={nodeStakeInfo.claimed}
              precision={2}
              suffix="CFLY"
            />
          </Col>
          <Col xs={12} sm={8}>
            <Statistic
              title="Claimable Rewards"
              value={claimable}
              precision={2}
              suffix="CFLY"
            />
               {claimable>0 && account && nodeStakeInfo.active && (   <Button type='primary' style={{ marginTop: 16 }} onClick={()=>{
      claimReward(nodeInfo.account, nodeInfo.peer_id, claimable).then(data=>{
        
      })
    }} >
        Claim
    </Button>) }
          </Col>
        </Row>


        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <div>
              <Text type="secondary">Last Claim</Text>
              <div>
                <Text>{formatDate(nodeStakeInfo.last_claim.timep)}</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div>
              <Text type="secondary">Stake Time</Text>
              <div>
                <Text>{formatDate(nodeStakeInfo.stake_time.timep)}</Text>
              </div>
            </div>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
              <div>
                   <Statistic title="APY" value={apy} suffix="%"/>
              </div>
            </Col>
            {!claimable>0 && nodeStakeInfo.active && nodeInfo.status === "active" && (
  <Col xs={24} sm={12}>
  <div>
  <Countdown title="Next Claim" value={deadline}  />
  </div>
</Col>
            )}
          
          </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24}>
             {canStake ? ( <Button style={{ marginLeft:300 }}   type="primary" onClick={()=>{
                nodeStake(nodeInfo.account, nodeInfo.peer_id).then(data=>{
                  if(data){
                    messageApi.info({content:"Submitted, Please wait a while"})
                  }
                })
              }}>
                    Stake
                  </Button>):( <Button style={{ marginLeft:300 }} type="primary" onClick={()=>{
                    nodeUnStake(nodeInfo.account, nodeInfo.peer_id).then(data=>{
                      if(data){
                        messageApi.info({content:"Submitted, Please wait a while"})
                      }
                    })
                  }}>
                    Unstake
                  </Button>)}
          </Col>
        </Row>
      </Space>
    </Card>
    )}
{nodeInfo && (<Card title="Node Information" style={{ maxWidth: 800 }}
   extra={
    <Tag color={nodeInfo.status=='active' ? 'success' : 'error'} icon={nodeInfo.status=='active' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
      {nodeInfo.status =='active' ? 'Node Active' : 'Node Inactive'}
    </Tag>
  }
>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text type="secondary">Peer Id</Text>
          <div>
            <Text copyable style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {peerId}
            </Text>
          </div>
        </div>

        <div>
          <Text type="secondary">Guard</Text>
          <ReactJson src={nodeInfo.guard} theme={isDarkMode? 'apathy':'apathy:inverted'}/>
          </div>

        <div>
          <Text type="secondary">Multiaddr</Text>
          <div>
            <Text copyable style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {nodeInfo.multiaddr}
            </Text>
          </div>
        </div>
      </Space>
    </Card>)}

   
        </PageContainer>
    );
}
 
export default NodeDetail;
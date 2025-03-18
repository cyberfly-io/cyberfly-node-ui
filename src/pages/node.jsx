import { PageContainer } from "@ant-design/pro-components";
import { useState, useEffect } from "react";
import { getNodeStake, getNode, getNodeClaimable, getAPY, claimReward, nodeStake, nodeUnStake } from "../services/pact-services";
import { Button, Card, Col, Row, Tag, message as msg, Grid } from "antd";
import { Space } from "antd";
import { Typography } from "antd";
import ReactJson from "react-json-view";
import { useDarkMode } from '../contexts/DarkModeContext';
import { Statistic } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, WalletOutlined } from "@ant-design/icons";
import {  useParams } from 'react-router-dom';
import { useKadenaWalletContext } from "../contexts/kadenaWalletContext";
import { Result } from "antd";
const { Countdown } = Statistic;

const { Text } = Typography;
const { useBreakpoint } = Grid;

const NodeDetail = () => {
  const { account, initializeKadenaWallet  } = useKadenaWalletContext()
  const [messageApi, contextHolder] = msg.useMessage();

    const [nodeInfo, setNodeInfo] = useState(null);
    const [claimable, setClaimable] = useState(null);
    const [apy, setApy] = useState(null);
    const [nodeStakeInfo, setNodeStakeInfo] = useState(null);
    const [canStake, setCanStake] = useState(true)
    const [deadline, setDeadline] = useState(Date.now());
    const screens = useBreakpoint();

    const { isDarkMode } = useDarkMode();
    const {peerId} = useParams()

    useEffect(() => {
        if (peerId) {
            getNode(peerId).then((data) => {
              setNodeInfo(data);
                console.log(nodeInfo)
                getNodeStake(peerId).then((data) => {
                    setNodeStakeInfo(data);
                    
                  if(data){
                    if(data.active)
                      setCanStake(false)
                    const originalDate = new Date(data.last_claim.timep);
                    const nextTime = new Date(originalDate);
                    nextTime.setHours(originalDate.getHours() + 6);
                    setDeadline(nextTime);
                  }
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
            <Card title="Account"
            style={{ width: screens.xs ? '50%' : '100%' }}
            >
   <Text copyable={{text:nodeInfo.account ,tooltips: ['Copy', 'Copied'] }} style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {screens.xs ? nodeInfo.account.slice(0, 15) + '...' : nodeInfo.account}
            </Text>
            </Card>
          )}
           {nodeStakeInfo && (
      <Card 
      title="Staking Information" 
      style={{ width: screens.xs ? '50%' : '100%' }}
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
          <Col xs={24} sm={8}>
            <Statistic
              title="Claimed Rewards"
              value={nodeStakeInfo.claimed}
              precision={2}
              suffix="CFLY"
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Claimable Rewards"
              value={claimable}
              precision={2}
              suffix="CFLY"
            />
               {claimable>0 && account && nodeStakeInfo.active && (   <Button type='primary' style={{ marginTop: 16 }} onClick={()=>{
      claimReward(account, peerId, claimable).then(data=>{
        
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
     {account? (   <Row gutter={[24, 24]}>
          <Col xs={24} sm={24}>
             {canStake ? ( <Button style={{ marginLeft:screens.xs? 0:300 }}   type="primary" onClick={()=>{
                nodeStake(account, peerId).then(data=>{
                  if(data){
                    messageApi.info({content:"Submitted, Please wait a while"})
                  }
                })
              }}>
                    Stake
                  </Button>):( <Button style={{ marginLeft:screens.xs? 0:300  }} type="primary" onClick={()=>{
                    nodeUnStake(account, peerId).then(data=>{
                      if(data){
                        messageApi.info({content:"Submitted, Please wait a while"})
                      }
                    })
                  }}>
                    Unstake
                  </Button>)}
          </Col>
        </Row>):(<Result
    icon={<WalletOutlined />}
    title="Please connect your kadena wallet to claim rewards, stake, unstake"
    extra={<Button type="primary" onClick={()=>initializeKadenaWallet("eckoWallet")}>Connect</Button>}
  />)}
      </Space>
    </Card>
    )}
{nodeInfo && (<Card title="Node Information" style={{ width: screens.xs ? '50%' : '100%' }}
   extra={
    <Space>
    {canStake && !nodeStakeInfo && ( <Button size="small" style={{ marginLeft: screens.xs? 0:300 }}   type="primary" onClick={()=>{
                nodeStake(account, peerId).then(data=>{
                  if(data){
                    messageApi.info({content:"Submitted, Please wait a while"})
                  }
                })
              }}>
                    Stake
                  </Button>)}
                  <Tag color={nodeInfo.status==='active' ? 'success' : 'error'} icon={nodeInfo.status==='active' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
      {nodeInfo.status ==='active' ? 'Node Active' : 'Node Inactive'}
    </Tag>
    </Space>
  }
>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text type="secondary">Peer Id</Text>
          <div>
            <Text copyable={{text:peerId ,tooltips: ['Copy', 'Copied'] }} style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {screens.xs ? peerId.slice(0, 20) + '...' : peerId}
            </Text>
          </div>
        </div>

        <div>
          <Text type="secondary">Guard</Text>
          <ReactJson collapsed={screens.xs} src={nodeInfo.guard} theme={isDarkMode? 'apathy':'apathy:inverted'}/>
          </div>

        <div>
          <Text type="secondary">Multiaddr</Text>
          <div>
            <Text copyable={{text:nodeInfo.multiaddr ,tooltips: ['Copy', 'Copied'] }} style={{ fontFamily: 'monospace' }}>
              {screens.xs ? nodeInfo.multiaddr.slice(0, 20) + '...' : nodeInfo.multiaddr}
            </Text>
          </div>
        </div>
      </Space>
    </Card>)}

   
        </PageContainer>
    );
}
 
export default NodeDetail;
import { PageContainer } from "@ant-design/pro-components";
import { useState, useEffect } from "react";
import { getNodeStake, getNode, getNodeClaimable, getAPY } from "../services/pact-services";
import { Card, Col, Row, Tag } from "antd";
import { Space } from "antd";
import { Typography } from "antd";
import ReactJson from "react-json-view";
import { useDarkMode } from '../contexts/DarkModeContext';
import { Statistic } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import {  useParams } from 'react-router-dom';

const { Text } = Typography;
const NodeDetail = () => {

    const [nodeInfo, setNodeInfo] = useState(null);
    const [claimable, setClaimable] = useState(null);
    const [apy, setApy] = useState(null);
    const [nodeStakeInfo, setNodeStakeInfo] = useState(null);
    const { isDarkMode } = useDarkMode();
    const {peerId} = useParams()

    useEffect(() => {
        if (peerId) {
            getNode(peerId).then((data) => {
              setNodeInfo(data);
                console.log(nodeInfo)
                getNodeStake(peerId).then((data) => {
                    setNodeStakeInfo(data);
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
          {nodeInfo&& (
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
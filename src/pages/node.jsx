import { PageContainer } from "@ant-design/pro-components";
import { useState, useEffect } from "react";
import { getNodeStake, getNode, getNodeClaimable, getAPY, claimReward, nodeStake, nodeUnStake } from "../services/pact-services";
import { Button, Card, Col, Row, Tag, message as msg, Grid, Avatar, Divider, Progress } from "antd";
import { Space } from "antd";
import { Typography } from "antd";
import ReactJson from "react-json-view";
import { useDarkMode } from '../contexts/DarkModeContext';
import { Statistic } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  WalletOutlined,
  NodeIndexOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  UserOutlined,
  CrownOutlined,
  FireOutlined,
  CalendarOutlined,
  GiftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useParams } from 'react-router-dom';
import { useKadenaWalletContext } from "../contexts/kadenaWalletContext";
import { Result } from "antd";
const { Countdown } = Statistic;

const { Text, Title } = Typography;
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
                console.log(data)
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
        <PageContainer
            title={
                <Space>
                    <NodeIndexOutlined />
                    Node Details
                </Space>
            }
            subTitle={peerId ? `Peer ID: ${screens.xs ? peerId.slice(0, 12) + '...' : peerId.slice(0, 24) + '...'}` : 'Loading node information'}
            loading={!nodeInfo}
            header={{
                style: {
                    padding: '16px 0',
                    background: isDarkMode
                        ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px',
                    marginBottom: '24px'
                }
            }}
            extra={[
                nodeInfo && (
                    <Tag
                        color={nodeInfo.status === 'active' ? 'success' : 'error'}
                        icon={nodeInfo.status === 'active' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                        style={{ fontSize: '14px', padding: '4px 12px' }}
                    >
                        {nodeInfo.status === 'active' ? 'Active' : 'Inactive'}
                    </Tag>
                ),
                apy && (
                    <Tag
                        color="processing"
                        icon={<TrophyOutlined />}
                        style={{ fontSize: '14px', padding: '4px 12px' }}
                    >
                        {apy}% APY
                    </Tag>
                )
            ].filter(Boolean)}
        >
            {contextHolder}

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Node Overview Card */}
                {nodeInfo && (
                    <Card
                        title={
                            <Space>
                                <GlobalOutlined />
                                <span>Node Overview</span>
                            </Space>
                        }
                        bordered={false}
                        style={{
                            boxShadow: isDarkMode
                                ? '0 4px 12px rgba(0,0,0,0.3)'
                                : '0 4px 12px rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            background: isDarkMode
                                ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
                                : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        }}
                        extra={
                            <Space>
                                <Tag
                                    color={nodeInfo.status === 'active' ? 'success' : 'error'}
                                    icon={nodeInfo.status === 'active' ? <ThunderboltOutlined /> : <ClockCircleOutlined />}
                                >
                                    {nodeInfo.status === 'active' ? 'Online' : 'Offline'}
                                </Tag>
                            </Space>
                        }
                    >
                        <Row gutter={[24, 16]}>
                            <Col xs={24} sm={12} lg={8}>
                                <div style={{ textAlign: 'center', padding: '16px', background: isDarkMode ? '#1f1f1f' : 'white', borderRadius: '8px' }}>
                                    <UserOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : undefined }}>Account</Text>
                                        <div style={{ marginTop: '4px' }}>
                                            <Text
                                                copyable={{ text: nodeInfo.account, tooltips: ['Copy', 'Copied'] }}
                                                style={{
                                                    wordBreak: 'break-all',
                                                    fontFamily: 'monospace',
                                                    fontSize: '13px',
                                                    display: 'block',
                                                    color: isDarkMode ? '#e0e0e0' : undefined
                                                }}
                                            >
                                                {screens.xs ? nodeInfo.account.slice(0, 20) + '...' : nodeInfo.account.slice(0, 32) + '...'}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <div style={{ textAlign: 'center', padding: '16px', background: isDarkMode ? '#1f1f1f' : 'white', borderRadius: '8px' }}>
                                    <NodeIndexOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : undefined }}>Peer ID</Text>
                                        <div style={{ marginTop: '4px' }}>
                                            <Text
                                                copyable={{ text: peerId, tooltips: ['Copy', 'Copied'] }}
                                                style={{
                                                    wordBreak: 'break-all',
                                                    fontFamily: 'monospace',
                                                    fontSize: '13px',
                                                    display: 'block',
                                                    color: isDarkMode ? '#e0e0e0' : undefined
                                                }}
                                            >
                                                {screens.xs ? peerId.slice(0, 20) + '...' : peerId.slice(0, 32) + '...'}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <div style={{ textAlign: 'center', padding: '16px', background: isDarkMode ? '#1f1f1f' : 'white', borderRadius: '8px' }}>
                                    <GlobalOutlined style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }} />
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px', color: isDarkMode ? '#b0b0b0' : undefined }}>Multiaddr</Text>
                                        <div style={{ marginTop: '4px' }}>
                                            <Text
                                                copyable={{ text: nodeInfo.multiaddr, tooltips: ['Copy', 'Copied'] }}
                                                style={{
                                                    wordBreak: 'break-all',
                                                    fontFamily: 'monospace',
                                                    fontSize: '13px',
                                                    display: 'block',
                                                    color: isDarkMode ? '#e0e0e0' : undefined
                                                }}
                                            >
                                                {screens.xs ? nodeInfo.multiaddr.slice(0, 20) + '...' : nodeInfo.multiaddr.slice(0, 32) + '...'}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                )}

                {/* Staking Information Card */}
                {nodeStakeInfo && (
                    <Card
                        title={
                            <Space>
                                <CrownOutlined />
                                <span>Staking Dashboard</span>
                            </Space>
                        }
                        bordered={false}
                        style={{
                            boxShadow: isDarkMode
                                ? '0 4px 12px rgba(0,0,0,0.3)'
                                : '0 4px 12px rgba(0,0,0,0.1)',
                            borderRadius: '12px'
                        }}
                        extra={
                            <Space>
                                <Tag
                                    color="processing"
                                    icon={<TrophyOutlined />}
                                    style={{ fontSize: '14px', padding: '4px 12px' }}
                                >
                                    {apy}% APY
                                </Tag>
                                <Tag
                                    color={nodeStakeInfo.active ? 'success' : 'error'}
                                    icon={nodeStakeInfo.active ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                                    style={{ fontSize: '14px', padding: '4px 12px' }}
                                >
                                    {nodeStakeInfo.active ? 'Stake Active' : 'Stake Inactive'}
                                </Tag>
                            </Space>
                        }
                    >
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            {/* Statistics Row */}
                            <Row gutter={[24, 24]}>
                                <Col xs={24} sm={12} lg={6}>
                                    <Card
                                        size="small"
                                        style={{
                                            textAlign: 'center',
                                            background: isDarkMode
                                                ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none'
                                        }}
                                    >
                                        <Statistic
                                            title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Staked Amount</Text>}
                                            value={nodeStakeInfo.amount}
                                            precision={2}
                                            suffix="CFLY"
                                            valueStyle={{ color: 'white', fontSize: '24px' }}
                                            prefix={<DollarOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} lg={6}>
                                    <Card
                                        size="small"
                                        style={{
                                            textAlign: 'center',
                                            background: isDarkMode
                                                ? 'linear-gradient(135deg, #7b1fa2 0%, #c2185b 100%)'
                                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            color: 'white',
                                            border: 'none'
                                        }}
                                    >
                                        <Statistic
                                            title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Claimed Rewards</Text>}
                                            value={nodeStakeInfo.claimed}
                                            precision={2}
                                            suffix="CFLY"
                                            valueStyle={{ color: 'white', fontSize: '24px' }}
                                            prefix={<GiftOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} lg={6}>
                                    <Card
                                        size="small"
                                        style={{
                                            textAlign: 'center',
                                            background: claimable > 0
                                                ? (isDarkMode
                                                    ? 'linear-gradient(135deg, #0277bd 0%, #00acc1 100%)'
                                                    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)')
                                                : (isDarkMode
                                                    ? 'linear-gradient(135deg, #424242 0%, #616161 100%)'
                                                    : 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)'),
                                            color: 'white',
                                            border: 'none'
                                        }}
                                    >
                                        <Statistic
                                            title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Claimable Rewards</Text>}
                                            value={claimable || 0}
                                            precision={2}
                                            suffix="CFLY"
                                            valueStyle={{ color: 'white', fontSize: '24px' }}
                                            prefix={<FireOutlined />}
                                        />
                                        {claimable > 0 && account && nodeStakeInfo.active && (
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<GiftOutlined />}
                                                style={{
                                                    marginTop: '12px',
                                                    background: 'rgba(255,255,255,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.3)'
                                                }}
                                                onClick={() => {
                                                    claimReward(account, peerId, claimable).then(data => {
                                                        // Handle success
                                                    });
                                                }}
                                            >
                                                Claim
                                            </Button>
                                        )}
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} lg={6}>
                                    <Card
                                        size="small"
                                        style={{
                                            textAlign: 'center',
                                            background: isDarkMode
                                                ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
                                                : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                            color: 'white',
                                            border: 'none'
                                        }}
                                    >
                                        <Statistic
                                            title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Current APY</Text>}
                                            value={apy}
                                            suffix="%"
                                            valueStyle={{ color: 'white', fontSize: '24px' }}
                                            prefix={<TrophyOutlined />}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* Timeline Information */}
                            <Row gutter={[24, 24]}>
                                <Col xs={24} sm={12}>
                                    <Card
                                        size="small"
                                        title={
                                            <Space>
                                                <CalendarOutlined />
                                                <span>Last Claim</span>
                                            </Space>
                                        }
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <div style={{ textAlign: 'center', padding: '8px' }}>
                                            <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                {formatDate(nodeStakeInfo.last_claim.timep)}
                                            </Text>
                                        </div>
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Card
                                        size="small"
                                        title={
                                            <Space>
                                                <CalendarOutlined />
                                                <span>Stake Time</span>
                                            </Space>
                                        }
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <div style={{ textAlign: 'center', padding: '8px' }}>
                                            <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                {formatDate(nodeStakeInfo.stake_time.timep)}
                                            </Text>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Countdown Timer */}
                            {!claimable > 0 && nodeStakeInfo.active && nodeInfo.status === "active" && (
                                <Card
                                    title={
                                        <Space>
                                            <ClockCircleOutlined />
                                            <span>Next Claim Countdown</span>
                                        </Space>
                                    }
                                    style={{
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white'
                                    }}
                                >
                                    <div style={{ textAlign: 'center', padding: '16px' }}>
                                        <Countdown
                                            title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Time until next claim</Text>}
                                            value={deadline}
                                            format="HH:mm:ss"
                                            valueStyle={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}
                                        />
                                    </div>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            {account ? (
                                <Card
                                    style={{
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                                    }}
                                >
                                    <div style={{ textAlign: 'center', padding: '16px' }}>
                                        <Space size="large">
                                            {canStake ? (
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    icon={<ArrowUpOutlined />}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        border: 'none',
                                                        height: '48px',
                                                        fontSize: '16px',
                                                        padding: '0 32px'
                                                    }}
                                                    onClick={() => {
                                                        nodeStake(account, peerId).then(data => {
                                                            if (data) {
                                                                messageApi.info({ content: "Submitted, Please wait a while" });
                                                            }
                                                        });
                                                    }}
                                                >
                                                    Stake Node
                                                </Button>
                                            ) : (
                                                <Button
                                                    danger
                                                    size="large"
                                                    icon={<ArrowDownOutlined />}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                                                        border: 'none',
                                                        height: '48px',
                                                        fontSize: '16px',
                                                        padding: '0 32px'
                                                    }}
                                                    onClick={() => {
                                                        nodeUnStake(account, peerId).then(data => {
                                                            if (data) {
                                                                messageApi.info({ content: "Submitted, Please wait a while" });
                                                            }
                                                        });
                                                    }}
                                                >
                                                    Unstake Node
                                                </Button>
                                            )}
                                        </Space>
                                    </div>
                                </Card>
                            ) : (
                                <Result
                                    icon={<WalletOutlined style={{ fontSize: '64px', color: '#1890ff' }} />}
                                    title={<Text style={{ fontSize: '20px', fontWeight: 'bold' }}>Connect Your Wallet</Text>}
                                    subTitle={<Text type="secondary">Connect your Kadena wallet to manage staking and claim rewards</Text>}
                                    extra={
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<WalletOutlined />}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                height: '48px',
                                                fontSize: '16px',
                                                padding: '0 32px'
                                            }}
                                            onClick={() => initializeKadenaWallet("eckoWallet")}
                                        >
                                            Connect Wallet
                                        </Button>
                                    }
                                />
                            )}
                        </Space>
                    </Card>
                )}

                {/* Node Technical Details */}
                {nodeInfo && (
                    <Card
                        title={
                            <Space>
                                <InfoCircleOutlined />
                                <span>Technical Details</span>
                            </Space>
                        }
                        bordered={false}
                        style={{
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderRadius: '12px'
                        }}
                        extra={
                            <Space>
                                {canStake && !nodeStakeInfo && (
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<CrownOutlined />}
                                        onClick={() => {
                                            nodeStake(account, peerId).then(data => {
                                                if (data) {
                                                    messageApi.info({ content: "Submitted, Please wait a while" });
                                                }
                                            });
                                        }}
                                    >
                                        Stake Node
                                    </Button>
                                )}
                            </Space>
                        }
                    >
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            {/* Guard Information */}
                            <div>
                                <Title level={5} style={{ marginBottom: '12px' }}>
                                    <Space>
                                        <UserOutlined />
                                        Guard Configuration
                                    </Space>
                                </Title>
                                <Card
                                    size="small"
                                    style={{
                                        background: '#f8f9fa',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <ReactJson
                                        collapsed={screens.xs}
                                        src={nodeInfo.guard}
                                        theme={isDarkMode ? 'apathy' : 'apathy:inverted'}
                                        style={{ fontSize: '12px' }}
                                    />
                                </Card>
                            </div>
                        </Space>
                    </Card>
                )}
            </Space>
        </PageContainer>
    );
}
 
export default NodeDetail;
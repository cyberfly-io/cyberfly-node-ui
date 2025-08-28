import { PageContainer } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { getMyNodes, getNodeStake } from '../services/pact-services';
import {
  Card, Spin, Result, Button, Tooltip, Grid, Row, Col, Space, Tag,
  Statistic, Avatar, Typography, Empty, Divider
} from 'antd';
import { useKadenaWalletContext } from '../contexts/kadenaWalletContext';
import {
  WalletOutlined, EyeOutlined, NodeIndexOutlined, CrownOutlined,
  CheckCircleOutlined, ClockCircleOutlined, GlobalOutlined,
  ThunderboltOutlined, DatabaseOutlined, TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const MyNode = () => {
  const [mynodes, setMyNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nodeStakes, setNodeStakes] = useState({});
  const { initializeKadenaWallet, account } = useKadenaWalletContext();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { isDarkMode } = useDarkMode();

  const fetchNodeStakes = async (nodes) => {
    const stakes = {};
    await Promise.all(
      nodes.map(async (node) => {
        try {
          const stakeData = await getNodeStake(node.peer_id);
          stakes[node.peer_id] = stakeData;
        } catch (error) {
          console.error(`Error fetching stake for node ${node.peer_id}:`, error);
          stakes[node.peer_id] = { active: false };
        }
      })
    );
    setNodeStakes(stakes);
  };

  useEffect(() => {
    if (account) {
      setLoading(true);
      getMyNodes(account).then((data) => {
        setMyNodes(data);
        fetchNodeStakes(data).finally(() => {
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }
  }, [account]);

  // Calculate statistics
  const totalNodes = mynodes.length;
  const activeNodes = mynodes.filter(node => node.status === 'active').length;
  const inactiveNodes = totalNodes - activeNodes;
  const stakedNodes = Object.values(nodeStakes).filter(stake => stake?.active).length;

  const renderNodeCard = (node) => {
    const stakeInfo = nodeStakes[node.peer_id];
    const isActive = node.status === 'active';
    const isStaked = stakeInfo?.active;

    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={node.peer_id}>
        <Card
          hoverable
          style={{
            borderRadius: '12px',
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.1)',
            background: isDarkMode
              ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: isActive ? '1px solid #52c41a' : '1px solid #ff4d4f',
            marginBottom: '16px'
          }}
          actions={[
            <Tooltip title="View Details">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/node/${node.peer_id}`)}
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                    : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                View
              </Button>
            </Tooltip>
          ]}
        >
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Avatar
              size={64}
              icon={<NodeIndexOutlined />}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                  : 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                marginBottom: '16px'
              }}
            />

            <Title level={4} style={{ margin: '8px 0', color: isDarkMode ? '#e0e0e0' : undefined }}>
              Node {node.peer_id.slice(0, 8)}...
            </Title>

            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text type="secondary" style={{ color: isDarkMode ? '#b0b0b0' : undefined }}>
                  Peer ID
                </Text>
                <div>
                  <Text
                    copyable={{ text: node.peer_id, tooltips: ['Copy', 'Copied'] }}
                    style={{
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: isDarkMode ? '#e0e0e0' : undefined
                    }}
                  >
                    {screens.xs ? node.peer_id.slice(0, 15) + '...' : node.peer_id.slice(0, 20) + '...'}
                  </Text>
                </div>
              </div>

              <Divider style={{ margin: '12px 0', borderColor: isDarkMode ? '#444' : '#f0f0f0' }} />

              <Row gutter={8}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Tag
                      color={isActive ? 'success' : 'error'}
                      icon={isActive ? <ThunderboltOutlined /> : <ClockCircleOutlined />}
                      style={{ marginBottom: '4px' }}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Tag
                      color={isStaked ? 'success' : 'default'}
                      icon={isStaked ? <CrownOutlined /> : <DatabaseOutlined />}
                      style={{ marginBottom: '4px' }}
                    >
                      {isStaked ? 'Staked' : 'Unstaked'}
                    </Tag>
                  </div>
                </Col>
              </Row>

              {stakeInfo && (
                <div style={{ marginTop: '12px' }}>
                  <Text type="secondary" style={{ color: isDarkMode ? '#b0b0b0' : undefined, fontSize: '12px' }}>
                    Staked Amount
                  </Text>
                  <div>
                    <Text style={{
                      fontWeight: 'bold',
                      color: isStaked ? '#52c41a' : '#ff4d4f',
                      fontSize: '14px'
                    }}>
                      {stakeInfo.amount || 0} CFLY
                    </Text>
                  </div>
                </div>
              )}
            </Space>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <PageContainer
      title={
        <Space>
          <DatabaseOutlined />
          <span>My Nodes</span>
        </Space>
      }
      subTitle={account ? `Connected Account: ${screens.xs ? account.slice(0, 12) + '...' : account.slice(0, 24) + '...'}` : 'Connect wallet to view nodes'}
      loading={loading}
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
    >
      <Spin spinning={loading} tip="Loading your nodes..." size="large" />

      {account && mynodes.length > 0 && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Statistics Overview */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: 'center',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                <Statistic
                  title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Total Nodes</Text>}
                  value={totalNodes}
                  prefix={<NodeIndexOutlined />}
                  valueStyle={{ color: 'white', fontSize: '32px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: 'center',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
                    : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                <Statistic
                  title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Active Nodes</Text>}
                  value={activeNodes}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: 'white', fontSize: '32px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: 'center',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #c2185b 0%, #e91e63 100%)'
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                <Statistic
                  title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Inactive Nodes</Text>}
                  value={inactiveNodes}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: 'white', fontSize: '32px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: 'center',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
                    : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                <Statistic
                  title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Staked Nodes</Text>}
                  value={stakedNodes}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: 'white', fontSize: '32px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Nodes Grid */}
          <Card
            title={
              <Space>
                <GlobalOutlined />
                <span>Your Nodes</span>
              </Space>
            }
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: isDarkMode
                ? '0 4px 12px rgba(0,0,0,0.3)'
                : '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Row gutter={[16, 16]}>
              {mynodes.map(renderNodeCard)}
            </Row>
          </Card>
        </Space>
      )}

      {account && mynodes.length === 0 && !loading && (
        <Card
          style={{
            textAlign: 'center',
            borderRadius: '12px',
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical">
                <Text style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>
                  No nodes found for your account
                </Text>
                <Text type="secondary" style={{ color: isDarkMode ? '#b0b0b0' : undefined }}>
                  You haven't staked any nodes yet
                </Text>
              </Space>
            }
          />
        </Card>
      )}

      {!account && (
        <Result
          icon={<WalletOutlined style={{ fontSize: '64px', color: '#1890ff' }} />}
          title={
            <Title level={3} style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>
              Connect Your Wallet
            </Title>
          }
          subTitle={
            <Text style={{ color: isDarkMode ? '#b0b0b0' : undefined }}>
              Connect your Kadena wallet to view and manage your nodes
            </Text>
          }
          extra={
            <Button
              type="primary"
              size="large"
              icon={<WalletOutlined />}
              onClick={() => initializeKadenaWallet("eckoWallet")}
              style={{
                background: isDarkMode
                  ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                  : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                border: 'none',
                height: '48px',
                fontSize: '16px',
                padding: '0 32px',
                borderRadius: '8px'
              }}
            >
              Connect Wallet
            </Button>
          }
        />
      )}
    </PageContainer>
  );
};

export default MyNode;
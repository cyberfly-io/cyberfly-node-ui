import { Col, Row, Divider, Typography, Collapse, Card, Progress, Tooltip, Badge, Space, Avatar, Tag, Button, Statistic, Grid } from 'antd';
import { GridContent } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { getNodeInfo } from '../services/node-services';
import { PageContainer } from '@ant-design/pro-components';
import { 
  ApartmentOutlined, 
  InfoCircleOutlined, 
  DeploymentUnitOutlined, 
  RadarChartOutlined, 
  DollarOutlined, 
  ApiOutlined, 
  EyeOutlined, 
  PercentageOutlined,
  WifiOutlined,
  GlobalOutlined,
  LockOutlined,
  TrophyOutlined,
  NodeIndexOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { getActiveNodes, getAPY, getStakeStats } from '../services/pact-services';
import { getIPFromMultiAddr } from '../utils/utils';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const { Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const MainContent = () => {
  const [peers, setPeers] = useState([]);
  const [peerItems, setPeerItems] = useState([]);
  const [cCount, setCCount] = useState(0);
  const [dCount, setDCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState();
  const [nodeInfo, setNodeInfo] = useState(null);
  const [activeNodes, setActiveNodes] = useState(0);
  const [locked, setLocked] = useState(0);
  const [stakesCount, setStakesCount] = useState(0);
  const navigate = useNavigate();
  const [apy, setApy] = useState(0);
  const screens = useBreakpoint();
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    function getInfo() {
      getNodeInfo().then((data) => {
        setNodeInfo(data);
        setCCount(data.connected);
        setDCount(data.discovered);
        setVersion(data.version);
        setPeers(data.connections);
        setLoading(false);
      });
      getActiveNodes().then((data) => {
        setActiveNodes(data.length);
      });
      getStakeStats().then((data) => {
        setStakesCount(data['total-stakes']['int']);
        setLocked(data['total-staked-amount']);
      });
      getAPY().then((data) => {
        setApy(data);
      });
    }
    getInfo();
    const intervalId = setInterval(getInfo, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (peers) {
      const items = peers.map((item, index) => ({
        key: item.remotePeer,
        label: (
          <Space>
            <Avatar size="small" icon={<NodeIndexOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <Text strong>{item.remotePeer.substring(0, 12)}...</Text>
            <Badge status="success" text="Connected" />
          </Space>
        ),
        children: (
          <Card size="small" style={{ background: '#fafafa' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Peer ID: </Text>
                <Paragraph 
                  copyable={{ tooltips: ['Copy', 'Copied'] }}
                  style={{ margin: 0, display: 'inline' }}
                >
                  {item.remotePeer}
                </Paragraph>
              </div>
              <div>
                <Text strong>Address: </Text>
                <a 
                  rel='noreferrer' 
                  target="_blank" 
                  href={getIPFromMultiAddr(item.remoteAddr)}
                  style={{ color: '#1890ff' }}
                >
                  {item.remoteAddr}
                </a>
                <Paragraph 
                  copyable={{ text: item.remoteAddr, tooltips: ['Copy', 'Copied'] }}
                  style={{ margin: 0, display: 'inline', marginLeft: 8 }}
                />
              </div>
              <div>
                <Text strong>Status: </Text>
                <Tag color="success" icon={<ThunderboltOutlined />}>Active</Tag>
              </div>
            </Space>
          </Card>
        ),
      }));
      setPeerItems(items);
    }
  }, [peers]);

  // Calculate network health percentage
  const networkHealth = Math.min(100, (cCount / Math.max(activeNodes, 1)) * 100);

  return (
    <PageContainer
      title={
        <Space>
          <GlobalOutlined />
          <span>Network Dashboard</span>
        </Space>
      }
      subTitle="Real-time node and network statistics"
      loading={{ spinning: loading }}
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
        version ? (
          <Tag color="blue" icon={<InfoCircleOutlined />}>
            v{version}
          </Tag>
        ) : null
      ]}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Node Information Card */}
        {nodeInfo && (
          <Card
            title={
              <Space>
                <DeploymentUnitOutlined />
                <span>Node Information</span>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            extra={
              <Space>
                <Tag color={nodeInfo?.health === 'ok' ? 'success' : 'error'}>
                  {nodeInfo?.health === 'ok' ? 'Active' : 'Inactive'}
                </Tag>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/node/${nodeInfo?.peerId}`)}
                  size="small"
                >
                  View Details
                </Button>
              </Space>
            }
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <div>
                  <Text type="secondary">Peer ID</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text
                      copyable={{ text: nodeInfo?.peerId, tooltips: ['Copy', 'Copied'] }}
                      style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}
                    >
                      {screens.xs ? nodeInfo?.peerId?.slice(0, 20) + '...' : nodeInfo?.peerId}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div>
                  <Text type="secondary">Account</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text
                      copyable={{ text: nodeInfo?.account, tooltips: ['Copy', 'Copied'] }}
                      style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}
                    >
                      {screens.xs ? nodeInfo?.account?.slice(0, 20) + '...' : nodeInfo?.account}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div>
                  <Text type="secondary">Version</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="blue">v{version}</Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Network Statistics Card */}
        <Card
          title={
            <Space>
              <RadarChartOutlined />
              <span>Network Statistics</span>
            </Space>
          }
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Connected Peers"
                value={cCount}
                prefix={<ApartmentOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Discovered Peers"
                value={dCount}
                prefix={<WifiOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Active Nodes"
                value={activeNodes}
                prefix={<GlobalOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Network APY"
                value={apy}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Staking Information Card */}
        <Card
          title={
            <Space>
              <LockOutlined />
              <span>Staking Overview</span>
            </Space>
          }
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Statistic
                title="Total Stakes"
                value={stakesCount}
                prefix={<ApiOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Statistic
                title="Locked Supply"
                value={locked}
                prefix={<DollarOutlined />}
                suffix="CFLY"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Statistic
                title="Reward Rate"
                value={apy}
                suffix="% APY"
                prefix={<PercentageOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Connected Peers Card */}
        <Card
          title={
            <Space>
              <WifiOutlined />
              <span>Connected Peers</span>
              <Badge count={cCount} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          extra={
            <Text type="secondary">
              {dCount} discovered • {cCount} connected
            </Text>
          }
        >
          {peerItems.length > 0 ? (
            <Collapse
              items={peerItems}
              collapsible="icon"
              defaultActiveKey={[]} // Start collapsed
              expandIcon={({ isActive }) => (
                <NodeIndexOutlined rotate={isActive ? 90 : 0} />
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <WifiOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">No peers connected</Text>
              </div>
            </div>
          )}
        </Card>

        {/* Network Status Footer */}
        <Card
          size="small"
          bordered={false}
          style={{ background: '#fafafa', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <GlobalOutlined style={{ color: '#1890ff' }} />
                <Text strong>Network Status</Text>
                <Badge status="success" text="Operational" />
              </Space>
            </Col>
            <Col>
              <Text type="secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Text>
            </Col>
          </Row>
        </Card>
      </Space>
    </PageContainer>
  );
};

export default MainContent;

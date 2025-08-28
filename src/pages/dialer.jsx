import { PageContainer } from '@ant-design/pro-components'
import React, { useState } from 'react'
import {
  Form, Input, Button, Flex, notification, Card, Row, Col,
  Space, Typography, Avatar, Tag, Alert, Spin, Empty, Divider
} from 'antd';
import {
  GlobalOutlined, SearchOutlined, CheckCircleOutlined,
  CloseCircleOutlined, LoadingOutlined, NodeIndexOutlined,
  ThunderboltOutlined, WifiOutlined, DatabaseOutlined
} from '@ant-design/icons';
import { dialNode, findPeer } from '../services/node-services';
import ReactJson from 'react-json-view';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getNode } from '../services/pact-services';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Dialer = () => {
  const [api, contextHolder] = notification.useNotification();
  const [peerInfo, setPeerInfo] = useState(null)
  const [nodeInfo, setNodeInfo] = useState(null)
  const [loadingDial, setLoadingDial] = useState(false)
  const [loadingPeer, setLoadingPeer] = useState(false)
  const [dialStatus, setDialStatus] = useState(null)
  const [peerStatus, setPeerStatus] = useState(null)
  const { isDarkMode } = useDarkMode();

  const onFinish = async (values) => {
    console.log('Received values:', values);
    setLoadingDial(true);
    setDialStatus('loading');

    try {
      const data = await dialNode(values.multiaddr);
      console.log(data);
      setDialStatus('success');
      api.success({
        message: 'Connection Test Successful',
        description: data.info,
        placement: 'topRight'
      });
    } catch (error) {
      setDialStatus('error');
      api.error({
        message: 'Connection Test Failed',
        description: 'Unable to establish connection to the provided multi-address',
        placement: 'topRight'
      });
    } finally {
      setLoadingDial(false);
    }
  };

  const onFindPeer = async (values) => {
    console.log('Received values:', values);
    setLoadingPeer(true);
    setPeerStatus('loading');

    try {
      // Get node info from pact services
      const nodeRes = await getNode(values.peerId);
      setNodeInfo(nodeRes);

      // Get peer info from node services
      const peerData = await findPeer(values.peerId);
      setPeerInfo(peerData);

      setPeerStatus('success');
      api.success({
        message: 'Peer Found Successfully',
        description: `Found peer: ${values.peerId.slice(0, 20)}...`,
        placement: 'topRight'
      });
    } catch (error) {
      setPeerStatus('error');
      setPeerInfo(null);
      setNodeInfo(null);
      api.error({
        message: 'Peer Not Found',
        description: 'Unable to find the specified peer or retrieve node information',
        placement: 'topRight'
      });
    } finally {
      setLoadingPeer(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const clearResults = () => {
    setPeerInfo(null);
    setNodeInfo(null);
    setDialStatus(null);
    setPeerStatus(null);
  };

  return (
    <PageContainer
      title={
        <Space>
          <GlobalOutlined />
          <span>Network Connection Tools</span>
        </Space>
      }
      subTitle="Test multi-address connections and find network peers"
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
        (peerInfo || nodeInfo) && (
          <Button
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={clearResults}
            danger
          >
            Clear Results
          </Button>
        )
      ].filter(Boolean)}
    >
      {contextHolder}

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[24, 24]}>
          {/* Multi-Address Connection Test */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ThunderboltOutlined />
                  <span>Connection Test</span>
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: '12px',
                boxShadow: isDarkMode
                  ? '0 4px 12px rgba(0,0,0,0.3)'
                  : '0 4px 12px rgba(0,0,0,0.1)',
                height: '100%'
              }}
              extra={
                dialStatus && (
                  <Tag
                    color={
                      dialStatus === 'success' ? 'success' :
                      dialStatus === 'error' ? 'error' : 'processing'
                    }
                    icon={
                      dialStatus === 'success' ? <CheckCircleOutlined /> :
                      dialStatus === 'error' ? <CloseCircleOutlined /> :
                      <LoadingOutlined />
                    }
                  >
                    {dialStatus === 'success' ? 'Connected' :
                     dialStatus === 'error' ? 'Failed' : 'Testing...'}
                  </Tag>
                )
              }
            >
              <Form
                name="dialForm"
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
              >
                <Form.Item
                  label={
                    <Text style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>
                      Multi-Address
                    </Text>
                  }
                  name="multiaddr"
                  rules={[
                    {
                      required: true,
                      message: 'Please input multi-address!',
                    },
                  ]}
                >
                  <Input
                    size='large'
                    placeholder="Enter multi-address to test connection"
                    style={{
                      background: isDarkMode ? '#1f1f1f' : undefined,
                      color: isDarkMode ? '#e0e0e0' : undefined
                    }}
                    prefix={<WifiOutlined style={{ color: isDarkMode ? '#b0b0b0' : undefined }} />}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loadingDial}
                    icon={<ThunderboltOutlined />}
                    style={{
                      width: '100%',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                        : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                      border: 'none',
                      height: '48px'
                    }}
                  >
                    {loadingDial ? 'Testing Connection...' : 'Test Connection'}
                  </Button>
                </Form.Item>
              </Form>

              {dialStatus === 'success' && (
                <Alert
                  message="Connection Successful"
                  description="The multi-address is reachable and responding correctly."
                  type="success"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              )}

              {dialStatus === 'error' && (
                <Alert
                  message="Connection Failed"
                  description="Unable to establish connection. Please check the multi-address and try again."
                  type="error"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              )}
            </Card>
          </Col>

          {/* Peer Discovery */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <SearchOutlined />
                  <span>Peer Discovery</span>
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: '12px',
                boxShadow: isDarkMode
                  ? '0 4px 12px rgba(0,0,0,0.3)'
                  : '0 4px 12px rgba(0,0,0,0.1)',
                height: '100%'
              }}
              extra={
                peerStatus && (
                  <Tag
                    color={
                      peerStatus === 'success' ? 'success' :
                      peerStatus === 'error' ? 'error' : 'processing'
                    }
                    icon={
                      peerStatus === 'success' ? <CheckCircleOutlined /> :
                      peerStatus === 'error' ? <CloseCircleOutlined /> :
                      <LoadingOutlined />
                    }
                  >
                    {peerStatus === 'success' ? 'Found' :
                     peerStatus === 'error' ? 'Not Found' : 'Searching...'}
                  </Tag>
                )
              }
            >
              <Form
                name="peerForm"
                layout="vertical"
                onFinish={onFindPeer}
              >
                <Form.Item
                  label={
                    <Text style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>
                      Peer ID
                    </Text>
                  }
                  name="peerId"
                  rules={[
                    {
                      required: true,
                      message: 'Please input peer ID!',
                    },
                  ]}
                >
                  <Input
                    size='large'
                    placeholder="Enter peer ID to search"
                    style={{
                      background: isDarkMode ? '#1f1f1f' : undefined,
                      color: isDarkMode ? '#e0e0e0' : undefined
                    }}
                    prefix={<NodeIndexOutlined style={{ color: isDarkMode ? '#b0b0b0' : undefined }} />}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loadingPeer}
                    icon={<SearchOutlined />}
                    style={{
                      width: '100%',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                        : 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                      border: 'none',
                      height: '48px'
                    }}
                  >
                    {loadingPeer ? 'Searching...' : 'Find Peer'}
                  </Button>
                </Form.Item>
              </Form>

              {peerStatus === 'success' && (
                <Alert
                  message="Peer Found"
                  description="Successfully retrieved peer and node information."
                  type="success"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              )}

              {peerStatus === 'error' && (
                <Alert
                  message="Peer Not Found"
                  description="The specified peer ID could not be found in the network."
                  type="error"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Results Section */}
        {(peerInfo || nodeInfo) && (
          <Card
            title={
              <Space>
                <DatabaseOutlined />
                <span>Query Results</span>
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
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {peerInfo && (
                <div>
                  <Title level={4} style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>
                    <Space>
                      <NodeIndexOutlined />
                      Peer Information
                    </Space>
                  </Title>
                  <Card
                    size="small"
                    style={{
                      background: isDarkMode ? '#1f1f1f' : '#fafafa',
                      borderRadius: '8px'
                    }}
                  >
                    <ReactJson
                      src={peerInfo}
                      theme={isDarkMode ? 'apathy' : 'apathy:inverted'}
                      style={{ fontSize: '12px' }}
                    />
                  </Card>
                </div>
              )}

              {nodeInfo && (
                <div>
                  <Title level={4} style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>
                    <Space>
                      <DatabaseOutlined />
                      Node Information
                    </Space>
                  </Title>
                  <Card
                    size="small"
                    style={{
                      background: isDarkMode ? '#1f1f1f' : '#fafafa',
                      borderRadius: '8px'
                    }}
                  >
                    <ReactJson
                      src={nodeInfo}
                      theme={isDarkMode ? 'apathy' : 'apathy:inverted'}
                      style={{ fontSize: '12px' }}
                    />
                  </Card>
                </div>
              )}
            </Space>
          </Card>
        )}

        {/* Empty State */}
        {!peerInfo && !nodeInfo && !loadingDial && !loadingPeer && (
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: isDarkMode
                ? '0 4px 12px rgba(0,0,0,0.3)'
                : '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical">
                  <Text style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>
                    No results yet
                  </Text>
                  <Text type="secondary" style={{ color: isDarkMode ? '#b0b0b0' : undefined }}>
                    Use the tools above to test connections or find peers
                  </Text>
                </Space>
              }
            />
          </Card>
        )}
      </Space>
    </PageContainer>
  )
}

export default Dialer
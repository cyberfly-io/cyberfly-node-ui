import { PageContainer } from '@ant-design/pro-components'
import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Space, Typography, Spin, Statistic, Tag, Divider, Button, Switch, Select, message } from 'antd';
import { getNode } from '../services/pact-services'
import { getNodeInfo } from '../services/node-services'
import { useDarkMode } from '../contexts/DarkModeContext';
import {
  SettingOutlined,
  UserOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  ApiOutlined,
  NodeIndexOutlined,
  ThunderboltOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Option } = Select;

const Settings = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [nodeInfo, setNodeInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [networkNode, setNetworkNode] = useState(null)
  const [settings, setSettings] = useState({
    theme: isDarkMode ? 'dark' : 'light',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 5000
  })

  useEffect(()=>{
    loadNodeInfo()
  },[])

  useEffect(()=>{
   if(nodeInfo){
    getNode(nodeInfo.peerId).then((data)=>{
      setNetworkNode(data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
   }
  }, [nodeInfo])

  const loadNodeInfo = () => {
    setLoading(true)
    getNodeInfo().then((data)=>{
     setNodeInfo(data)
    }).catch(() => {
      setLoading(false)
    })
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))

    if (key === 'theme') {
      if (value === 'dark' && !isDarkMode) {
        toggleDarkMode()
      } else if (value === 'light' && isDarkMode) {
        toggleDarkMode()
      }
    }
  }

  const saveSettings = () => {
    // Here you would typically save to localStorage or backend
    localStorage.setItem('cyberfly-settings', JSON.stringify(settings))
    message.success('Settings saved successfully!')
  }

  return (
    <PageContainer
      title={
        <Space>
          <SettingOutlined />
          <span>Settings</span>
        </Space>
      }
      subTitle="Configure your node and application preferences"
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
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={loadNodeInfo}
          loading={loading}
        >
          Refresh
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={saveSettings}
        >
          Save Settings
        </Button>
      ]}
    >
      <Spin spinning={loading} tip="Loading settings..." size="large">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Node Information Section */}
          <Card
            title={
              <Space>
                <NodeIndexOutlined />
                <span>Node Information</span>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={8}>
                <Statistic
                  title="Peer ID"
                  value={nodeInfo?.peerId ? `${nodeInfo.peerId.substring(0, 12)}...` : 'Not available'}
                  prefix={<NodeIndexOutlined />}
                />
                {nodeInfo?.peerId && (
                  <Paragraph
                    copyable={{ text: nodeInfo.peerId }}
                    style={{ marginTop: 8, fontSize: 12 }}
                  >
                    <Text type="secondary">Click to copy full peer ID</Text>
                  </Paragraph>
                )}
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Statistic
                  title="Node Owner"
                  value={nodeInfo?.account ? `${nodeInfo.account.substring(0, 12)}...` : 'Not available'}
                  prefix={<UserOutlined />}
                />
                {nodeInfo?.account && (
                  <Paragraph
                    copyable={{ text: nodeInfo.account }}
                    style={{ marginTop: 8, fontSize: 12 }}
                  >
                    <Text type="secondary">Click to copy full account</Text>
                  </Paragraph>
                )}
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Statistic
                  title="Version"
                  value={nodeInfo?.version || 'Unknown'}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
            </Row>

            {networkNode && (
              <>
                <Divider />
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={12} lg={6}>
                    <Statistic
                      title="Connected Peers"
                      value={networkNode.connected || 0}
                      prefix={<GlobalOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Statistic
                      title="Discovered Peers"
                      value={networkNode.discovered || 0}
                      prefix={<ApiOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Statistic
                      title="Active Stakes"
                      value={networkNode.stakes || 0}
                      prefix={<DatabaseOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Statistic
                      title="Network Status"
                      value="Online"
                      valueStyle={{ color: '#52c41a' }}
                      prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
                    />
                  </Col>
                </Row>
              </>
            )}
          </Card>

          {/* Application Settings */}
          <Card
            title={
              <Space>
                <SettingOutlined />
                <span>Application Settings</span>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Theme</Text>
                  <Select
                    value={settings.theme}
                    onChange={(value) => handleSettingChange('theme', value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="light">Light</Option>
                    <Option value="dark">Dark</Option>
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Notifications</Text>
                  <Switch
                    checked={settings.notifications}
                    onChange={(checked) => handleSettingChange('notifications', checked)}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Auto Refresh</Text>
                  <Switch
                    checked={settings.autoRefresh}
                    onChange={(checked) => handleSettingChange('autoRefresh', checked)}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Refresh Interval (ms)</Text>
                  <Select
                    value={settings.refreshInterval}
                    onChange={(value) => handleSettingChange('refreshInterval', value)}
                    style={{ width: '100%' }}
                    disabled={!settings.autoRefresh}
                  >
                    <Option value={2000}>2 seconds</Option>
                    <Option value={5000}>5 seconds</Option>
                    <Option value={10000}>10 seconds</Option>
                    <Option value={30000}>30 seconds</Option>
                  </Select>
                </div>
              </Col>
            </Row>
          </Card>

          {/* System Information */}
          <Card
            title="System Information"
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            size="small"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={6}>
                <Space direction="vertical" size="small">
                  <Text strong>Browser</Text>
                  <Text type="secondary">{navigator.userAgent.split(' ').pop()}</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Space direction="vertical" size="small">
                  <Text strong>Platform</Text>
                  <Text type="secondary">{navigator.platform}</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Space direction="vertical" size="small">
                  <Text strong>Language</Text>
                  <Text type="secondary">{navigator.language}</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Space direction="vertical" size="small">
                  <Text strong>Online</Text>
                  <Tag color={navigator.onLine ? 'success' : 'error'}>
                    {navigator.onLine ? 'Yes' : 'No'}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>
        </Space>
      </Spin>
    </PageContainer>
  )
}

export default Settings
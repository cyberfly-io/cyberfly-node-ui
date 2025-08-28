import { PageContainer } from '@ant-design/pro-components'
import React, { useEffect, useState } from 'react'
import { Button, Table, Card, Space, Typography, Statistic, Row, Col, Tag, Avatar, Tooltip, Input, Divider } from 'antd'
import { getActiveNodes } from '../services/pact-services';
import { getIPFromMultiAddr } from '../utils/utils';
import { SearchOutlined, NodeIndexOutlined, GlobalOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const { Text, Paragraph } = Typography;
const { Search } = Input;

const NodeList = () => {
  const [searchText, setSearchText] = useState('');
  const [nodes, setNodes] = useState([])
  const [filteredNodes, setFilteredNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    loadNodes()
  }, [])

  useEffect(() => {
    // Filter nodes based on search text
    if (searchText) {
      const filtered = nodes.filter(node =>
        node.peer_id?.toLowerCase().includes(searchText.toLowerCase()) ||
        getIPFromMultiAddr(node.multiaddr)?.toLowerCase().includes(searchText.toLowerCase()) ||
        node.status?.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredNodes(filtered)
    } else {
      setFilteredNodes(nodes)
    }
  }, [nodes, searchText])

  const loadNodes = () => {
    setLoading(true)
    getActiveNodes().then(data => {
      setNodes(data)
      setFilteredNodes(data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleReset = () => {
    setSearchText('')
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'active':
        return 'success'
      case 'offline':
      case 'inactive':
        return 'error'
      case 'syncing':
        return 'processing'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      title: 'Node Info',
      key: 'node_info',
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<NodeIndexOutlined />}
            style={{ backgroundColor: '#1890ff' }}
            size="small"
          />
          <div>
            <Text strong style={{ display: 'block' }}>
              {record.peer_id?.substring(0, 16)}...
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {getIPFromMultiAddr(record.multiaddr)}
            </Text>
          </div>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)} icon={<NodeIndexOutlined />}>
          {record.status || 'Unknown'}
        </Tag>
      ),
      responsive: ['sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Network Address',
      key: 'network_address',
      render: (_, record) => (
        <Tooltip title="Click to copy full address">
          <Paragraph
            copyable={{ text: getIPFromMultiAddr(record.multiaddr) }}
            style={{ margin: 0, maxWidth: 200 }}
            ellipsis
          >
            {getIPFromMultiAddr(record.multiaddr)}
          </Paragraph>
        </Tooltip>
      ),
      responsive: ['md', 'lg', 'xl']
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Button
          type='primary'
          icon={<EyeOutlined />}
          size="small"
          onClick={() => {
            navigate(`/node/${record.peer_id}`)
          }}
        >
          View Details
        </Button>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  ]

  return (
    <PageContainer
      title={
        <Space>
          <NodeIndexOutlined />
          <span>Network Nodes</span>
        </Space>
      }
      subTitle="Monitor and manage active nodes in the Cyberfly network"
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
          onClick={loadNodes}
          loading={loading}
        >
          Refresh
        </Button>
      ]}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Statistics Overview */}
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="Total Nodes"
                value={nodes.length}
                prefix={<NodeIndexOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="Active Nodes"
                value={nodes.filter(n => n.status === 'active' || n.status === 'online').length}
                prefix={<GlobalOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="Filtered Results"
                value={filteredNodes.length}
                prefix={<SearchOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="Network Health"
                value={nodes.length > 0 ? Math.round((nodes.filter(n => n.status === 'active' || n.status === 'online').length / nodes.length) * 100) : 0}
                suffix="%"
                prefix={<NodeIndexOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search and Filters */}
        <Card
          title={
            <Space>
              <SearchOutlined />
              <span>Search & Filter</span>
            </Space>
          }
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          size="small"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={16} lg={18}>
              <Search
                placeholder="Search by Peer ID, IP address, or status..."
                allowClear
                enterButton="Search"
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
              />
            </Col>
            <Col xs={24} sm={8} lg={6}>
              <Button
                onClick={handleReset}
                size="large"
                style={{ width: '100%' }}
                disabled={!searchText}
              >
                Clear Search
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Nodes Table */}
        <Card
          title={
            <Space>
              <NodeIndexOutlined />
              <span>Active Nodes</span>
              <Tag color="blue">{filteredNodes.length} nodes</Tag>
            </Space>
          }
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Table
            dataSource={filteredNodes}
            columns={columns}
            rowKey="peer_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} nodes`
            }}
            scroll={{ x: 600 }}
            size="middle"
          />
        </Card>

        {/* Information Section */}
        <Card
          title="Node Information"
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          size="small"
        >
          <Space direction="vertical" size="small">
            <Text strong>Understanding Node Status:</Text>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li><Tag color="success">Active/Online</Tag> - Node is fully operational and responding</li>
              <li><Tag color="processing">Syncing</Tag> - Node is synchronizing with the network</li>
              <li><Tag color="error">Offline/Inactive</Tag> - Node is not responding or unreachable</li>
            </ul>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary">
              Click "View Details" to see comprehensive information about any node, including its configuration,
              performance metrics, and network connections.
            </Text>
          </Space>
        </Card>
      </Space>
    </PageContainer>
  )
}

export default NodeList
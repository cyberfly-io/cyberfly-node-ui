import { PageContainer } from '@ant-design/pro-components'
import {
  Button, message as msg, Card, Space, Typography, Row, Col,
  Statistic, Tag, Tabs, Alert, Input, Tooltip, Empty, Descriptions,
  Badge, Modal as AntModal, Form, Select, Table
} from 'antd';
import {
  KeyOutlined, CopyOutlined, DownloadOutlined, HistoryOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined,
  ThunderboltOutlined, SafetyOutlined, FileTextOutlined, LockOutlined,
  EyeOutlined, EyeInvisibleOutlined, PlusOutlined, DeleteOutlined
} from '@ant-design/icons';
import { genKeyPair } from '@kadena/cryptography-utils';
import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const KadenaTools = () => {
  const { isDarkMode } = useDarkMode();
  const [messageApi, contextHolder] = msg.useMessage();
  const [keypair, setKeypair] = useState(null);
  const [keypairs, setKeypairs] = useState([]);
  const [activeTab, setActiveTab] = useState('generate');
  const [showPrivateKey, setShowPrivateKey] = useState({});
  const [keyStats, setKeyStats] = useState({
    totalKeys: 0,
    todayKeys: 0,
    lastGenerated: null
  });
  const [selectedKeypair, setSelectedKeypair] = useState(null);
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importForm] = Form.useForm();

  // Load saved keypairs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kadenaKeypairs');
    const stats = localStorage.getItem('kadenaKeyStats');

    if (saved) {
      setKeypairs(JSON.parse(saved));
    }
    if (stats) {
      setKeyStats(JSON.parse(stats));
    }
  }, []);

  // Save keypairs to localStorage
  const saveKeypairs = (keys) => {
    setKeypairs(keys);
    localStorage.setItem('kadenaKeypairs', JSON.stringify(keys));
  };

  // Update statistics
  const updateStats = () => {
    const newStats = {
      totalKeys: keypairs.length,
      todayKeys: keypairs.filter(k => {
        const today = new Date().toDateString();
        return new Date(k.createdAt).toDateString() === today;
      }).length,
      lastGenerated: new Date().toISOString()
    };
    setKeyStats(newStats);
    localStorage.setItem('kadenaKeyStats', JSON.stringify(newStats));
  };

  function saveAsFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  const generateKeypair = () => {
    const newKeypair = genKeyPair();
    const keypairWithMeta = {
      ...newKeypair,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      label: `Key ${keypairs.length + 1}`,
    };

    const updated = [keypairWithMeta, ...keypairs];
    saveKeypairs(updated);
    setKeypair(keypairWithMeta);
    updateStats();

    // Auto-save to file
    saveAsFile(newKeypair.secretKey, `kadena-privatekey-${newKeypair.secretKey.substring(0, 8)}.txt`);
    messageApi.success('New keypair generated and saved!');
  };

  const copyToClipboard = (text, type = 'key') => {
    navigator.clipboard.writeText(text);
    messageApi.success(`${type === 'key' ? 'Private key' : 'Public key'} copied to clipboard!`);
  };

  const deleteKeypair = (id) => {
    const updated = keypairs.filter(k => k.id !== id);
    saveKeypairs(updated);
    messageApi.success('Keypair deleted successfully');
  };

 

  const cardStyle = {
    background: isDarkMode
      ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    border: `1px solid ${isDarkMode ? '#404040' : '#e8e8e8'}`,
    borderRadius: '12px',
    boxShadow: isDarkMode
      ? '0 4px 20px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  };

  const statCardStyle = {
    ...cardStyle,
    textAlign: 'center',
    background: isDarkMode
      ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
      : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
    color: 'white'
  };

  const columns = [
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      render: (text, record) => (
        <Space>
          <KeyOutlined />
          <span>{text}</span>
          {record.imported && <Tag color="orange">Imported</Tag>}
        </Space>
      )
    },
    {
      title: 'Public Key',
      dataIndex: 'publicKey',
      key: 'publicKey',
      render: (text) => (
        <Text code copyable style={{ fontSize: '12px' }}>
          {text.substring(0, 20)}...
        </Text>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedKeypair(record);
                setKeyModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Copy Public Key">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(record.publicKey, 'public')}
            />
          </Tooltip>
          <Tooltip title="Download Private Key">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => saveAsFile(record.secretKey, `kadena-privatekey-${record.label}.txt`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteKeypair(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <PageContainer
      title={
        <Space>
          <KeyOutlined />
          <span>Kadena Tools</span>
        </Space>
      }
      subTitle="Cryptographic key management and blockchain utilities"
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
      {contextHolder}

    
      {/* Main Content */}
      <Card style={cardStyle} bodyStyle={{ padding: 0 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          {/* Generate Keys Tab */}
          <TabPane
            tab={
              <Space>
                <KeyOutlined />
                <span>Generate Keys</span>
              </Space>
            }
            key="generate"
          >
            <div style={{ padding: '24px' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card
                    title={
                      <Space>
                        <ThunderboltOutlined />
                        <span>Generate New Keypair</span>
                      </Space>
                    }
                    style={cardStyle}
                  >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <Text>
                        Generate a new cryptographic keypair for Kadena blockchain operations.
                        Your private key will be automatically saved to a file and stored locally.
                      </Text>

                      <Alert
                        message="Security Notice"
                        description="Keep your private keys secure and never share them. The generated keys are stored locally in your browser."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />

                      <Button
                        type="primary"
                        size="large"
                        icon={<KeyOutlined />}
                        onClick={generateKeypair}
                        block
                      >
                        Generate New Keypair
                      </Button>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card
                    title={
                      <Space>
                        <InfoCircleOutlined />
                        <span>Keypair Information</span>
                      </Space>
                    }
                    style={cardStyle}
                  >
                    {keypair ? (
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                          <Text strong>Public Key:</Text>
                          <br />
                          <Text code copyable style={{ wordBreak: 'break-all' }}>
                            {keypair.publicKey}
                          </Text>
                        </div>

                        <div>
                          <Text strong>Private Key:</Text>
                          <br />
                          <Space>
                            <Text code style={{ wordBreak: 'break-all' }}>
                              {showPrivateKey[keypair.id] ?
                                keypair.secretKey :
                                `${keypair.secretKey.substring(0, 20)}...`
                              }
                            </Text>
                            <Button
                              type="text"
                              size="small"
                              icon={showPrivateKey[keypair.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                              onClick={() => setShowPrivateKey(prev => ({
                                ...prev,
                                [keypair.id]: !prev[keypair.id]
                              }))}
                            />
                          </Space>
                        </div>

                        <Space>
                          <Button
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(keypair.publicKey, 'public')}
                          >
                            Copy Public
                          </Button>
                          <Button
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(keypair.secretKey, 'private')}
                          >
                            Copy Private
                          </Button>
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={() => saveAsFile(keypair.secretKey, `kadena-privatekey-${keypair.label}.txt`)}
                          >
                            Download
                          </Button>
                        </Space>
                      </Space>
                    ) : (
                      <Empty
                        description="No keypair generated yet"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>

          {/* Manage Keys Tab */}
          <TabPane
            tab={
              <Space>
                <LockOutlined />
                <span>Manage Keys</span>
                <Badge count={keypairs.length} size="small" />
              </Space>
            }
            key="manage"
          >
            <div style={{ padding: '24px' }}>
              <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                <Title level={4} style={{ margin: 0 }}>Your Keypairs</Title>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={generateKeypair}
                  >
                    Generate New
                  </Button>
                </Space>
              </Space>

              {keypairs.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={keypairs}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              ) : (
                <Empty
                  description="No keypairs found. Generate or import your first keypair."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </TabPane>

        
        </Tabs>
      </Card>

      {/* Key Details Modal */}
      <AntModal
        title={
          <Space>
            <KeyOutlined />
            <span>Keypair Details</span>
          </Space>
        }
        open={keyModalVisible}
        onCancel={() => setKeyModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedKeypair && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card size="small">
              <Descriptions column={1}>
                <Descriptions.Item label="Label">{selectedKeypair.label}</Descriptions.Item>
               
                <Descriptions.Item label="Created">
                  {new Date(selectedKeypair.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {selectedKeypair.imported ? 'Imported' : 'Generated'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title="Public Key"
              size="small"
              extra={
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(selectedKeypair.publicKey, 'public')}
                >
                  Copy
                </Button>
              }
            >
              <Text code style={{ wordBreak: 'break-all' }}>
                {selectedKeypair.publicKey}
              </Text>
            </Card>

            <Card
              title="Private Key"
              size="small"
              extra={
                <Space>
                  <Button
                    icon={showPrivateKey[selectedKeypair.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    onClick={() => setShowPrivateKey(prev => ({
                      ...prev,
                      [selectedKeypair.id]: !prev[selectedKeypair.id]
                    }))}
                  >
                    {showPrivateKey[selectedKeypair.id] ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(selectedKeypair.secretKey, 'private')}
                  >
                    Copy
                  </Button>
                </Space>
              }
            >
              <Text code style={{ wordBreak: 'break-all' }}>
                {showPrivateKey[selectedKeypair.id] ?
                  selectedKeypair.secretKey :
                  `${selectedKeypair.secretKey.substring(0, 20)}...`
                }
              </Text>
            </Card>
          </Space>
        )}
      </AntModal>

    
    </PageContainer>
  )
}

export default KadenaTools
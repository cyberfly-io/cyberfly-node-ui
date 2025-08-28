import { PageContainer } from '@ant-design/pro-components'
import React from 'react'
import FileUpload from '../components/FileUpload';
import { Card, Typography, Space, Divider } from 'antd';
import { FileAddOutlined, CloudUploadOutlined, InfoCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useDarkMode } from '../contexts/DarkModeContext';

const { Title, Text, Paragraph } = Typography;

const Files = () => {
  const { isDarkMode } = useDarkMode();
  return (
    <PageContainer
      title={
        <Space>
          <FileTextOutlined />
          <span>File Management</span>
        </Space>
      }
      subTitle="Upload and manage files on the Cyberfly network"
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
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Card */}
        <Card
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                <FileAddOutlined style={{ marginRight: 12 }} />
                File Upload Center
              </Title>
              <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
                Upload files to the decentralized Cyberfly network for secure storage and sharing
              </Paragraph>
            </div>
            <div style={{ textAlign: 'right' }}>
              <CloudUploadOutlined style={{ fontSize: 48, color: '#52c41a', opacity: 0.7 }} />
            </div>
          </Space>
        </Card>

        {/* File Upload Component */}
        <Card
          title={
            <Space>
              <CloudUploadOutlined />
              <span>Upload Files</span>
            </Space>
          }
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <FileUpload />
        </Card>

        {/* Information Section */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined />
              <span>How It Works</span>
            </Space>
          }
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          size="small"
        >
          <Space direction="vertical" size="middle">
            <div>
              <Title level={5} style={{ margin: 0 }}>Decentralized File Storage</Title>
              <Paragraph style={{ margin: '8px 0' }}>
                Files uploaded to Cyberfly are stored across the decentralized network using IPFS and Libp2p protocols,
                ensuring high availability and censorship resistance.
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={5} style={{ margin: 0 }}>Supported File Types</Title>
              <Paragraph style={{ margin: '8px 0' }}>
                You can upload various file types including documents, images, videos, and archives.
                Large files are automatically chunked for efficient transfer.
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={5} style={{ margin: 0 }}>Security & Privacy</Title>
              <Paragraph style={{ margin: '8px 0' }}>
                All files are encrypted during transfer and can be shared with specific peers or made publicly accessible.
                You maintain full control over your data.
              </Paragraph>
            </div>
          </Space>
        </Card>

        {/* Features Grid */}
        <Card
          title="Key Features"
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          size="small"
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center', padding: '16px', border: '1px solid #f0f0f0', borderRadius: 8 }}>
              <CloudUploadOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
              <Title level={5} style={{ margin: '0 0 8px 0' }}>Fast Upload</Title>
              <Text type="secondary">Optimized chunking for large files</Text>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', border: '1px solid #f0f0f0', borderRadius: 8 }}>
              <InfoCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
              <Title level={5} style={{ margin: '0 0 8px 0' }}>Secure Storage</Title>
              <Text type="secondary">End-to-end encryption and integrity checks</Text>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', border: '1px solid #f0f0f0', borderRadius: 8 }}>
              <FileAddOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
              <Title level={5} style={{ margin: '0 0 8px 0' }}>Easy Sharing</Title>
              <Text type="secondary">Share files with peers or make public</Text>
            </div>
          </div>
        </Card>
      </Space>
    </PageContainer>
  )
}

export default Files
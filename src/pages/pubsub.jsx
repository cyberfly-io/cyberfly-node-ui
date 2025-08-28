import { PageContainer } from '@ant-design/pro-components'
import React, { useState, useEffect, useRef } from 'react'
import {
  Flex, Form, Input, Button, Tag, Divider, message as msg, notification,
  Card, Row, Col, Space, Typography, Avatar, Badge, List, Empty, Alert
} from 'antd'
import {
  WifiOutlined, SendOutlined, NotificationOutlined, GlobalOutlined,
  MessageOutlined, ThunderboltOutlined, DisconnectOutlined,
  CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined
} from '@ant-design/icons';
import { io } from "socket.io-client";
import { getHost } from '../services/node-services';
import { useDarkMode } from '../contexts/DarkModeContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PubSubPage = () => {

const [topics, setTopics] = useState([])
const [form]  = Form.useForm();
const [publishForm] = Form.useForm();
const [messageApi, contextHolder] = msg.useMessage();
const [api, notificationContextHolder] = notification.useNotification();
const [connectionStatus, setConnectionStatus] = useState('connecting');
const [messageHistory, setMessageHistory] = useState([]);
const { isDarkMode } = useDarkMode();
const socketRef = useRef(null);

const host = getHost(); // Get the host without protocol
const protocol = window.location.protocol; // Get the current protocol
let url = `${protocol}//${host}`
if(protocol==="https:"&&host.includes('3100')){
  url = host.replace("31000", "31003")
}
else if(protocol==="http:"){
  url = "https://node.cyberfly.io"
}
console.log(url)

// Initialize socket
if (!socketRef.current) {
  socketRef.current = io(url);
}

const socket = socketRef.current;

useEffect(() => {
  socket.on("connect",()=>{
    setConnectionStatus('connected');
    messageApi.open({
      type:"success",
      content:"WebSocket connected successfully"
    })
  })

  socket.on("disconnect", () => {
    setConnectionStatus('disconnected');
    messageApi.open({
      type:"warning",
      content:"WebSocket disconnected"
    })
  })

  socket.on("onmessage", (data)=>{
    const {topic, message} = data
    console.log(topic, message)

    // Add to message history
    setMessageHistory(prev => [{
      id: Date.now(),
      topic,
      message,
      timestamp: new Date(),
      type: 'received'
    }, ...prev.slice(0, 49)]) // Keep last 50 messages

    api.info({
      message:`Message received for topic: ${topic}`,
      description: message.length > 100 ? message.substring(0, 100) + '...' : message,
      placement:"topRight",
      duration: 4
    })
  })

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("onmessage");
  }
}, [messageApi, api, socket])

const onFinish = async (values) => {
  form.resetFields()
  console.log('Received values:', values);
  let updatedTopics = [...topics];
  updatedTopics.push(values.topic)
  socket.emit("subscribe", values.topic)
  messageApi.open({
    type: 'success',
    content: `Subscribed to ${values.topic}`,
  });
  setTopics(updatedTopics)
};

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const handlePublish = async (values) => {
  socket.emit("publish", {topic: values.topic, message: values.message})

  // Add to message history
  setMessageHistory(prev => [{
    id: Date.now(),
    topic: values.topic,
    message: values.message,
    timestamp: new Date(),
    type: 'sent'
  }, ...prev.slice(0, 49)])

  messageApi.open({
    type:"success",
    content:"Message published successfully"
  })

  publishForm.resetFields()
}

const handleUnsubscribe = (topicToRemove) => {
  setTopics(prev => prev.filter(topic => topic !== topicToRemove))
  socket.emit("unsubscribe", topicToRemove)
  messageApi.open({
    type: 'info',
    content: `Unsubscribed from ${topicToRemove}`,
  });
}

const clearMessageHistory = () => {
  setMessageHistory([])
  messageApi.open({
    type: 'info',
    content: 'Message history cleared',
  });
}

  return (
    <PageContainer
      title={
        <Space>
          <GlobalOutlined />
          <span>PubSub Communication</span>
        </Space>
      }
      subTitle="Real-time messaging with WebSocket connection"
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
        <Badge
          status={connectionStatus === 'connected' ? 'success' : connectionStatus === 'connecting' ? 'processing' : 'error'}
          text={
            <Text style={{ color: 'white' }}>
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </Text>
          }
        />
      ]}
    >
      {contextHolder}
      {notificationContextHolder}

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Connection Status Card */}
        <Card
          bordered={false}
          style={{
            borderRadius: '12px',
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.1)',
            background: isDarkMode
              ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
          }}
        >
          <Row gutter={16} align="middle">
            <Col>
              <Avatar
                size={48}
                icon={
                  connectionStatus === 'connected' ? <ThunderboltOutlined /> :
                  connectionStatus === 'connecting' ? <WifiOutlined /> :
                  <DisconnectOutlined />
                }
                style={{
                  background: connectionStatus === 'connected' ? '#52c41a' :
                             connectionStatus === 'connecting' ? '#faad14' : '#ff4d4f'
                }}
              />
            </Col>
            <Col flex="auto">
              <Title level={4} style={{ margin: 0, color: isDarkMode ? '#e0e0e0' : undefined }}>
                WebSocket Connection
              </Title>
              <Text type="secondary" style={{ color: isDarkMode ? '#b0b0b0' : undefined }}>
                {connectionStatus === 'connected' ? 'Connected to CyberFly node' :
                 connectionStatus === 'connecting' ? 'Establishing connection...' :
                 'Connection lost - attempting to reconnect'}
              </Text>
            </Col>
            <Col>
              <Tag
                color={
                  connectionStatus === 'connected' ? 'success' :
                  connectionStatus === 'connecting' ? 'warning' : 'error'
                }
                icon={
                  connectionStatus === 'connected' ? <CheckCircleOutlined /> :
                  connectionStatus === 'connecting' ? <ClockCircleOutlined /> :
                  <DisconnectOutlined />
                }
              >
                {connectionStatus === 'connected' ? 'Online' :
                 connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
              </Tag>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Subscribe Section */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <NotificationOutlined />
                  <span>Subscribe to Topics</span>
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
            >
              <Form
                form={form}
                name="subscribe"
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
              >
                <Form.Item
                  label={<Text style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>Topic Name</Text>}
                  name="topic"
                  rules={[
                    {
                      required: true,
                      message: 'Please input topic name!',
                    },
                  ]}
                >
                  <Input
                    size='large'
                    placeholder="Enter topic to subscribe"
                    style={{
                      background: isDarkMode ? '#1f1f1f' : undefined,
                      color: isDarkMode ? '#e0e0e0' : undefined
                    }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<NotificationOutlined />}
                    style={{
                      width: '100%',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                        : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                      border: 'none',
                      height: '48px'
                    }}
                  >
                    Subscribe to Topic
                  </Button>
                </Form.Item>
              </Form>

              {/* Subscribed Topics */}
              {topics.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <Text style={{ color: isDarkMode ? '#e0e0e0' : undefined, fontWeight: 'bold' }}>
                    Active Subscriptions ({topics.length})
                  </Text>
                  <div style={{ marginTop: '12px' }}>
                    {topics.map((topic, index) => (
                      <Tag
                        key={index}
                        closable
                        onClose={() => handleUnsubscribe(topic)}
                        style={{
                          margin: '4px 4px 0 0',
                          background: isDarkMode ? '#1f1f1f' : undefined,
                          color: isDarkMode ? '#e0e0e0' : undefined,
                          borderColor: isDarkMode ? '#444' : undefined
                        }}
                      >
                        {topic}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* Publish Section */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <SendOutlined />
                  <span>Publish Messages</span>
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
            >
              <Form
                form={publishForm}
                name="publish"
                layout="vertical"
                onFinish={handlePublish}
              >
                <Form.Item
                  label={<Text style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>Topic</Text>}
                  name="topic"
                  rules={[
                    {
                      required: true,
                      message: 'Please input topic!',
                    },
                  ]}
                >
                  <Input
                    size='large'
                    placeholder="Enter topic to publish to"
                    style={{
                      background: isDarkMode ? '#1f1f1f' : undefined,
                      color: isDarkMode ? '#e0e0e0' : undefined
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={<Text style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>Message</Text>}
                  name="message"
                  rules={[
                    {
                      required: true,
                      message: 'Please input message!',
                    },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Enter your message"
                    style={{
                      background: isDarkMode ? '#1f1f1f' : undefined,
                      color: isDarkMode ? '#e0e0e0' : undefined
                    }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SendOutlined />}
                    style={{
                      width: '100%',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                        : 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                      border: 'none',
                      height: '48px'
                    }}
                  >
                    Publish Message
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Message History */}
        {messageHistory.length > 0 && (
          <Card
            title={
              <Space>
                <MessageOutlined />
                <span>Message History</span>
                <Badge count={messageHistory.length} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            }
            extra={
              <Button
                size="small"
                icon={<DeleteOutlined />}
                onClick={clearMessageHistory}
                danger
              >
                Clear History
              </Button>
            }
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: isDarkMode
                ? '0 4px 12px rgba(0,0,0,0.3)'
                : '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <List
              dataSource={messageHistory}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '12px',
                    background: isDarkMode ? '#1f1f1f' : '#fafafa',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${isDarkMode ? '#333' : '#f0f0f0'}`
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={item.type === 'sent' ? <SendOutlined /> : <NotificationOutlined />}
                        style={{
                          background: item.type === 'sent' ? '#52c41a' : '#1890ff'
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>
                          Topic: <Text code>{item.topic}</Text>
                        </Text>
                        <Tag
                          color={item.type === 'sent' ? 'success' : 'processing'}
                          size="small"
                        >
                          {item.type === 'sent' ? 'Sent' : 'Received'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Text style={{ color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          {item.message}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.timestamp.toLocaleString()}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Empty State for Message History */}
        {messageHistory.length === 0 && (
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
                    No messages yet
                  </Text>
                  <Text type="secondary" style={{ color: isDarkMode ? '#b0b0b0' : undefined }}>
                    Subscribe to topics and publish messages to see them here
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

export default PubSubPage
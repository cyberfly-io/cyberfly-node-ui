import { PageContainer } from '@ant-design/pro-components'
import React, { useState } from 'react'
import { Form, Input, Button, Flex, notification } from 'antd';
import { dialNode, findPeer } from '../services/node-services';
import ReactJson from 'react-json-view';
import { useDarkMode } from '../contexts/DarkModeContext';

const Dialer = () => {
  const [api, contextHolder] = notification.useNotification();
  const [peerInfo, setPeerInfo] = useState(null)
  const { isDarkMode } = useDarkMode();



  const onFinish = (values) => {
    console.log('Received values:', values);
    dialNode(values.multiaddr).then((data)=>{
      console.log(data)
      api.success({message:data.info})
    })
  };

  const onFindPeer = (values) => {
    console.log('Received values:', values);
    findPeer(values.peerId).then((data)=>{
      setPeerInfo(data)
    })
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };


  return (
   <PageContainer title="Multi address connection checker">
    {contextHolder}
      <Flex vertical={true}>
      <Form
      name="basic"
      layout="vertical"
      style={{ maxWidth: 600 }}
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item
        label="Multi Address"
        name="multiaddr"
        rules={[
          {
            required: true,
            message: 'Please input multi address!',
          },
        ]}
      >
        <Input size='large' />
      </Form.Item>
  
      <Form.Item>
        <Button type="primary" htmlType="submit">
          check
        </Button>
      </Form.Item>
    </Form>

    <Form
      name="basic"
      layout="vertical"
      style={{ maxWidth: 600 }}
      initialValues={{
        remember: true,
      }}
      onFinish={onFindPeer}
    >
      <Form.Item
        label="Peer Id"
        name="peerId"
        rules={[
          {
            required: true,
            message: 'Please input peerId!',
          },
        ]}
      >
        <Input size='large' />
      </Form.Item>
  
      <Form.Item>
        <Button type="primary" htmlType="submit">
          find peer
        </Button>
      </Form.Item>
    </Form>
    
      </Flex>
      {peerInfo &&     (<ReactJson src={peerInfo} theme={isDarkMode? 'apathy':'apathy:inverted'}/>)
}
   </PageContainer>
  )
}

export default Dialer
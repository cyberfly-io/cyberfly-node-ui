import { PageContainer } from '@ant-design/pro-components'
import React from 'react'
import { Form, Input, Button, Flex, notification } from 'antd';
import { dialNode } from '../services/node-services';

const Dialer = () => {
  const [api, contextHolder] = notification.useNotification();


  const onFinish = (values) => {
    console.log('Received values:', values);
    dialNode(values.multiaddr).then((data)=>{
      console.log(data)
      api.success({message:data.info})
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
    
      </Flex>
   </PageContainer>
  )
}

export default Dialer
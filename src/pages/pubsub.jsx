import { PageContainer } from '@ant-design/pro-components'
import React from 'react'
import { Flex, Form, Input, Button, Tag, Divider, message } from 'antd'
import { useLibp2p } from '../contexts/Libp2pContext'
import { fromString } from 'uint8arrays/from-string'
const PubSubPage = () => {

const {libp2pState, topics, setTopics} = useLibp2p()
const [form]  = Form.useForm();
const [messageApi, contextHolder] = message.useMessage();

const onFinish = async (values) => {
  form.resetFields()
  console.log('Received values:', values);
  const updatedTopics = [...topics, values.topic];
 setTopics(updatedTopics)
await libp2pState.services.pubsub.subscribe(values.topic)
messageApi.open({
  type: 'success',
  content: "Subscribed to "+values.topic,
});

};

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};
  return (
    <PageContainer title="PubSub Test">
      {contextHolder}
       <Flex vertical={true}>
      <Form
      form={form}

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
        label="Topic"
        name="topic"
        rules={[
          {
            required: true,
            message: 'Please input topic!',
          },
        ]}
      >
        <Input size='large' />
      </Form.Item>
  
      <Form.Item>
        <Button type="primary" htmlType="submit">
        Subscribe
        </Button>
      </Form.Item>
    </Form>
    

      </Flex>
      {topics.length>0 && (<Divider orientation="left">Subscribed Topics</Divider>)}

      {topics.map((tag, index) => (
        <Tag closeIcon key={index}>{tag}</Tag>
      ))}
 <Divider orientation="left">Publish Message</Divider>
<Flex vertical={true}>
      <Form

      name="message"
      layout="vertical"
      style={{ maxWidth: 600 }}
      initialValues={{
        remember: true,
      }}
      onFinish={async(values)=>{
        await libp2pState.services.pubsub.publish(values.topic, fromString(values.message))
        messageApi.open({type:"success", content:"Message published"})
      
      }}
    >
      <Form.Item
        label="Topic"
        name="topic"
        rules={[
          {
            required: true,
            message: 'Please input topic!',
          },
        ]}
      >
        <Input size='large' />
      </Form.Item>
      <Form.Item
        label="Message"
        name="message"
        rules={[
          {
            required: true,
            message: 'Please input message!',
          },
        ]}
      >
        <Input size='large' />
      </Form.Item>
  
  
      <Form.Item>
        <Button type="primary" htmlType="submit">
        Publish
        </Button>
      </Form.Item>
    </Form>
    

      </Flex>
    </PageContainer>
  )
}

export default PubSubPage
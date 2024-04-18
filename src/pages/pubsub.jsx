import { PageContainer } from '@ant-design/pro-components'
import React, { useState } from 'react'
import { Flex, Form, Input, Button, Tag, Divider, message as msg, notification } from 'antd'
import { io } from "socket.io-client";

const PubSubPage = () => {

const [topics, setTopics] = useState([])
const [form]  = Form.useForm();
const [messageApi, contextHolder] = msg.useMessage();
const [api, notificationContextHolder] = notification.useNotification();
const socket = io("https://node.cyberfly.io");
socket.on("connect",()=>{
  messageApi.open({
    type:"success",
    "content":"Websocket connected"
  })
})

socket.on("onmessage", (data)=>{
  const {topic, message} = data
  console.log(topic, message)
  console.log(topics)
    api.info({message:`message received for topic- ${topic}`, description:message,placement:"topRight"})


 })
const onFinish = async (values) => {
  form.resetFields()
  console.log('Received values:', values);
  let updatedTopics = [...topics];
  updatedTopics.push(values.topic)
socket.emit("subscribe", values.topic)
messageApi.open({
  type: 'success',
  content: "Subscribed to "+values.topic,
});
setTopics(updatedTopics)
};

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};
  return (
    <PageContainer title="PubSub Test">
      {contextHolder}
      {notificationContextHolder}
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

      { topics.map((tag, index) => (
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
        socket.emit("publish",values.topic, values.message)
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
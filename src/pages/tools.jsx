import { PageContainer } from '@ant-design/pro-components'
import React, { useState } from 'react'
import { Form, Input, Button, Flex, Spin } from 'antd';
import ReactJson from 'react-json-view';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getDBInfo, getReadDB } from '../services/node-services';

const Tools = () => {
  const { isDarkMode } = useDarkMode();
const [loading, setLoading] = useState(false)
   const [dbinfo, setDbInfo] = useState(null)
   const [dbaddress, setDbAddress] = useState()
  const onFinish = (values) => {
    console.log('Received values:', values);
    setLoading(true)
    getDBInfo(values.dbaddress).then((data)=>{
      setDbInfo(data)
      setLoading(false)
    })
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const readDb = ()=>{
    if(dbaddress!==''){
      setLoading(true)
      getReadDB(dbaddress).then((data)=>{
        setDbInfo(data)
        setLoading(false)
      })
    }
  }
  return (
   <PageContainer title="Database Tool">
          <Spin spinning={loading} tip="Loading" fullscreen size='large'/>

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
        label="DB address"
        name="dbaddress"
        rules={[
          {
            required: true,
            message: 'Please input db address!',
          },
        ]}
      >
        <Input size='large' onChange={(e)=>{
         setDbAddress(e.target.value)   
        }}/>
      </Form.Item>
  
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Get DB Info
        </Button>
      </Form.Item>
      <Button type="primary" onClick={readDb}>
        Read DB
        </Button>
    </Form>
    
{dbinfo &&     (<ReactJson src={dbinfo} theme={isDarkMode? 'apathy':'apathy:inverted'}/>)
}
      </Flex>
   </PageContainer>
  )
}

export default Tools
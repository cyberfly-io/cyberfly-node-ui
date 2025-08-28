import { PageContainer } from '@ant-design/pro-components'
import React, { useState } from 'react'
import { Form, Input, Button, Spin, Card, Space, Typography, Divider, Alert } from 'antd';
import ReactJson from 'react-json-view';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getDBInfo, getReadDB } from '../services/node-services';
import { DatabaseOutlined, SearchOutlined, ReadOutlined, CodeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Tools = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false)
  const [dbinfo, setDbInfo] = useState(null)
  const [dbaddr, setDbaddr] = useState('')
  const [error, setError] = useState(null)

  const onFinish = (values) => {
    setLoading(true)
    setError(null)
    setDbInfo(null)

    getDBInfo(values.dbaddr).then((data)=>{
      setDbInfo(data)
      setLoading(false)
    }).catch((err) => {
      setError('Failed to fetch database info. Please check the address and try again.')
      setLoading(false)
    })
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    setError('Please provide a valid database address.')
  };

  const readDb = ()=>{
    if(dbaddr && dbaddr.trim() !== ''){
      setLoading(true)
      setError(null)
      setDbInfo(null)

      getReadDB(dbaddr).then((data)=>{
        setDbInfo(data)
        setLoading(false)
      }).catch((err) => {
        setError('Failed to read database. Please check the address and try again.')
        setLoading(false)
      })
    } else {
      setError('Please enter a database address first.')
    }
  }

  return (
   <PageContainer
     title={
       <Space>
         <DatabaseOutlined />
         <span>Database Tools</span>
       </Space>
     }
     subTitle="Query and analyze blockchain database information"
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
     <Spin spinning={loading} tip="Loading database information..." size='large'>
       <Space direction="vertical" size="large" style={{ width: '100%' }}>
         {/* Database Query Section */}
         <Card
           title={
             <Space>
               <DatabaseOutlined />
               <span>Database Query</span>
             </Space>
           }
           bordered={false}
           style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
         >
           <Form
             name="database-query"
             layout="vertical"
             style={{ width: '100%' }}
             onFinish={onFinish}
             onFinishFailed={onFinishFailed}
             autoComplete="off"
           >
             <Form.Item
               label={
                 <Space>
                   <CodeOutlined />
                   <span>Database Address</span>
                 </Space>
               }
               name="dbaddr"
               rules={[
                 {
                   required: true,
                   message: 'Please input database address!',
                 },
                 {
                   pattern: /^\/orbitdb/,
                   message: 'Database address should start with "/orbitdb"',
                 }
               ]}
               tooltip="Enter the OrbitDB database address (starts with '/orbitdb')"
             >
               <Input
                 size='large'
                 placeholder="/orbitdb/database-hash"
                 prefix={<DatabaseOutlined />}
                 onChange={(e)=>{
                  setDbaddr(e.target.value)
                  setError(null)
                 }}
                 allowClear
               />
             </Form.Item>

             <Form.Item>
               <Space size="middle">
                 <Button
                   type="primary"
                   htmlType="submit"
                   icon={<SearchOutlined />}
                   size="large"
                   loading={loading}
                 >
                   Get DB Info
                 </Button>
                 <Button
                   type="default"
                   onClick={readDb}
                   icon={<ReadOutlined />}
                   size="large"
                   disabled={!dbaddr.trim()}
                   loading={loading}
                 >
                   Read Database
                 </Button>
               </Space>
             </Form.Item>
           </Form>

           {error && (
             <Alert
               message="Error"
               description={error}
               type="error"
               showIcon
               closable
               onClose={() => setError(null)}
               style={{ marginTop: 16 }}
             />
           )}
         </Card>

         {/* Results Section */}
         {dbinfo && (
           <Card
             title={
               <Space>
                 <CodeOutlined />
                 <span>Query Results</span>
               </Space>
             }
             bordered={false}
             style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
           >
             <div style={{ marginBottom: 16 }}>
               <Text type="secondary">
                 Database address: <Text code>{dbaddr}</Text>
               </Text>
             </div>
             <ReactJson
               src={dbinfo}
               theme={isDarkMode ? 'apathy' : 'apathy:inverted'}
               collapsed={false}
               collapseStringsAfterLength={100}
               displayDataTypes={false}
               displayObjectSize={true}
               enableClipboard={true}
               style={{ borderRadius: 6, padding: 16 }}
             />
           </Card>
         )}

         {/* Help Section */}
         <Card
           title="Help & Usage"
           bordered={false}
           style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
           size="small"
         >
           <Space direction="vertical" size="small">
             <Text strong>How to use:</Text>
             <ul style={{ paddingLeft: 20, margin: 0 }}>
               <li>Enter a valid OrbitDB database address (starts with "/orbitdb")</li>
               <li>Click "Get DB Info" to retrieve database metadata</li>
               <li>Click "Read Database" to fetch the actual data</li>
               <li>Results will be displayed in JSON format below</li>
             </ul>
             <Divider style={{ margin: '12px 0' }} />
             <Text type="secondary">
               <strong>Note:</strong> Database addresses are typically found in OrbitDB deployments
               and can be used to query decentralized database state.
             </Text>
           </Space>
         </Card>
       </Space>
     </Spin>
   </PageContainer>
  )
}

export default Tools
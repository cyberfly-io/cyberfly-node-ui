import { PageContainer } from '@ant-design/pro-components'
import React, { useEffect, useState } from 'react'
import { getMyNodes } from '../services/pact-services'
import { Table, Spin, Result, Button, Tooltip } from 'antd';
import { useKadenaWalletContext } from '../contexts/kadenaWalletContext';
import {WalletOutlined, EyeOutlined} from "@ant-design/icons"
import { useNavigate } from 'react-router-dom';

const MyNode = () => {
  const [mynodes, setMyNodes] = useState([])

  const [loading, setLoading] = useState(true)
  const {initializeKadenaWallet, account  } = useKadenaWalletContext()

    const navigate = useNavigate();

  const columns = [
    {
      title: 'Peer',
      dataIndex: 'peer_id',
      key: 'peer',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        {
          text: 'Active',
          value: 'active',
        },
        {
          text: 'In Active',
          value: 'inactive',
        },
      ],
      onFilter: (value, record) => record.status.startsWith(value),
      width: '40%',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Tooltip title="View">
          <Button
            shape="round"
            onClick={() => {
              navigate(`/node/${record.peer_id}`)

            }}
            type="primary"
            icon={<EyeOutlined />}
          />
          </Tooltip>
      ),
    },
  ];
   
  useEffect(()=>{
if(account){
  setLoading(true)
  getMyNodes(account).then((data)=>{
    setMyNodes(data)
    setLoading(false)
   })
}
else{
  setLoading(false)
}
  },[account])




  return (
    <PageContainer title="My Node">
            <Spin spinning={loading} tip="Loading" fullscreen size='large'/>

{mynodes.length >0 && account && ( <Table
      columns={columns}
      dataSource={mynodes}
      rowKey="peer"
      
    />)}
  
  { !account && (  <Result
    icon={<WalletOutlined />}
    title="Please connect your kadena wallet to see your node details"
    extra={<Button type="primary" onClick={()=>initializeKadenaWallet("eckoWallet")}>Connect</Button>}
  />) }
    </PageContainer>
  )
}

export default MyNode
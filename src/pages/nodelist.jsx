import { PageContainer } from '@ant-design/pro-components'
import React, { useEffect, useState, useRef } from 'react'
import { Button, Table } from 'antd'
import { getAllActiveNodes } from '../services/pact-services';
import { getIPFromMultiAddr } from '../utils/utils';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Input } from 'antd';
import { Space } from 'antd';
import { Badge } from 'antd';
import { useNavigate } from 'react-router-dom';

const NodeList = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [nodes, setNodes] = useState([])
  const navigate = useNavigate();


  useEffect(() => { 
    getAllActiveNodes().then(data => {
      setNodes(data)
    })
  }, [])

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
    title: 'Peer ID',
    key: 'peer_id',
    dataIndex: 'peer_id',
    ...getColumnSearchProps('peer_id'),
  },
  {
    title: 'Status',
    key: 'status',
    render: (_, record) => (
      <Badge status="success" text={record.status} />
    )
  },
  {
    title: 'Node URL',
    key: 'node_url',
    render: (_, record) => (
    <a href={getIPFromMultiAddr(record.multiaddr)}> {getIPFromMultiAddr(record.multiaddr)}</a>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
    <Button type='primary' onClick={()=>{
      navigate(`/node/${record.peer_id}`)
    }}>Details</Button>
    ),
  }
]


  return (
   <PageContainer title="Active Nodes" loading={nodes.length === 0}>

{nodes && (<Table dataSource={nodes} columns={columns} />)}

   </PageContainer>
  )
}

export default NodeList
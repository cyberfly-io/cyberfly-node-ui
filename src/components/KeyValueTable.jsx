import React from 'react';
import { Table } from 'antd';

const KeyValueTable = ({ data }) => {
  // Convert data into a format accepted by Ant Design Table
  const dataSource = Object.keys(data).map(key => ({
    key,
    value: data[key]
  }));

  // Define columns for the table
  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      render: (_, record)=>{
        return (<b>{_}</b>)
      }
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value'
    }
  ];

  return <Table dataSource={dataSource} columns={columns} scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
  pagination={{ position: ['none'] }}
/>;
};

export default KeyValueTable;

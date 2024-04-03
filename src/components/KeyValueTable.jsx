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
      key: 'key'
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value'
    }
  ];

  return <Table dataSource={dataSource} columns={columns} />;
};

export default KeyValueTable;

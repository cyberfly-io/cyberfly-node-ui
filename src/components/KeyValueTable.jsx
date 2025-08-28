import React from 'react';
import { Table, Grid } from 'antd';

const { useBreakpoint } = Grid;

const KeyValueTable = ({ data }) => {
  const screens = useBreakpoint();

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
      width: screens.xs ? 120 : 200,
      render: (_, record)=>{
        return (<b style={{ fontSize: screens.xs ? '12px' : '14px' }}>{_}</b>)
      }
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (_, record)=>{
        const val = typeof _ =="object"? _.timep : _
        return (
          <span style={{
            fontSize: screens.xs ? '12px' : '14px',
            wordBreak: 'break-all',
            fontFamily: 'monospace'
          }}>
            {val}
          </span>
        )
      }
    }
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      scroll={{
        x: screens.xs ? 300 : 'max-content',
        y: screens.xs ? 'calc(100vh - 400px)' : 'calc(100vh - 300px)'
      }}
      pagination={{ position: ['none'] }}
      size={screens.xs ? 'small' : 'middle'}
      style={{
        fontSize: screens.xs ? '12px' : '14px'
      }}
    />
  );
};

export default KeyValueTable;

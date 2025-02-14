import { PageContainer } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { getMyNodes, getNodeStake } from '../services/pact-services';
import { Table, Spin, Result, Button, Tooltip, Grid } from 'antd';
import { useKadenaWalletContext } from '../contexts/kadenaWalletContext';
import { WalletOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { useBreakpoint } = Grid;

const MyNode = () => {
  const [mynodes, setMyNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nodeStakes, setNodeStakes] = useState({});
  const { initializeKadenaWallet, account } = useKadenaWalletContext();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const columns = [
    {
      title: 'Peer',
      key: 'peer',
      render: (_, record) => (
        <b>{screens.xs ? `${record.peer_id.slice(0, 15)}...`: record.peer_id}</b>
      )
    },
    {
      title: 'Stake',
      key: 'stake',
      render: (_, record) => (
        <span style={{ color: nodeStakes[record.peer_id]?.active ? 'green' : 'red' }}>
          {nodeStakes[record.peer_id]?.active ? 'true' : 'false'}
        </span>
      )
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
          text: 'Inactive',
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
              navigate(`/node/${record.peer_id}`);
            }}
            type="primary"
            icon={<EyeOutlined />}
            size={screens.xs ? 'small' : 'middle'}
          />
        </Tooltip>
      ),
    },
  ];

  const fetchNodeStakes = async (nodes) => {
    const stakes = {};
    await Promise.all(
      nodes.map(async (node) => {
        try {
          const stakeData = await getNodeStake(node.peer_id);
          stakes[node.peer_id] = stakeData;
        } catch (error) {
          console.error(`Error fetching stake for node ${node.peer_id}:`, error);
          stakes[node.peer_id] = { active: false };
        }
      })
    );
    setNodeStakes(stakes);
  };

  useEffect(() => {
    if (account) {
      setLoading(true);
      getMyNodes(account).then((data) => {
        setMyNodes(data);
        fetchNodeStakes(data).finally(() => {
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }
  }, [account]);

  return (
    <PageContainer title="My Node">
      <Spin spinning={loading} tip="Loading" fullscreen size="large" />
      {mynodes.length > 0 && account && (
        <Table
          columns={columns}
          dataSource={mynodes}
          rowKey="peer"
          size={screens.xs ? 'small' : 'middle'}
        />
      )}
      {!account && (
        <Result
          icon={<WalletOutlined />}
          title="Please connect your Kadena wallet to see your node details"
          extra={
            <Button
              type="primary"
              onClick={() => initializeKadenaWallet('eckoWallet')}
            >
              Connect
            </Button>
          }
        />
      )}
    </PageContainer>
  );
};

export default MyNode;
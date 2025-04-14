import { Col, Row, Divider, Typography, Collapse, Spin } from 'antd';
import { GridContent } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { getNodeInfo } from '../services/node-services';
import { StatisticCard, PageContainer } from '@ant-design/pro-components';
import { ApartmentOutlined, InfoCircleOutlined, DeploymentUnitOutlined, RadarChartOutlined, DollarOutlined, ApiOutlined } from '@ant-design/icons';
import { getActiveNodes, getStakeStats } from '../services/pact-services';
import { getIPFromMultiAddr } from '../utils/utils';

const { Paragraph } = Typography;

const MainContent = () => {
  const [peers, setPeers] = useState([]);
  const [peerItems, setPeerItems] = useState([]);
  const [cCount, setCCount] = useState(0);
  const [dCount, setDCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState();
  const [nodeInfo, setNodeInfo] = useState(null);
  const [activeNodes, setActiveNodes] = useState(0);
  const [locked, setLocked] = useState(0);
  const [stakesCount, setStakesCount] = useState(0);

  useEffect(() => {
    function getInfo() {
      getNodeInfo().then((data) => {
        setNodeInfo(data);
        setCCount(data.connected);
        setDCount(data.discovered);
        setVersion(data.version);
        setPeers(data.connections);
        setLoading(false);
      });
      getActiveNodes().then((data) => {
        setActiveNodes(data.length);
      });
      getStakeStats().then((data) => {
        setStakesCount(data['total-stakes']['int']);
        setLocked(data['total-staked-amount']);
      });
    }
    getInfo();
    const intervalId = setInterval(getInfo, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (peers) {
      const items = peers.map((item) => ({
        key: item.remotePeer,
        label: <Paragraph copyable={{ tooltips: ['Copy', 'Copied'] }}>{item.remotePeer}</Paragraph>,
        children: <><Paragraph copyable={{ tooltips: ['Copy', 'Copied'] }}><a rel='noreferrer' target="_blank" href={getIPFromMultiAddr(item.remoteAddr)}>{item.remoteAddr}</a></Paragraph></>,
      }));
      setPeerItems(items);
    }
  }, [peers]);



  return (
    <PageContainer ghost loading={{ spinning: loading }} header={{ title: "Dashboard" }} tabBarExtraContent={version ? `Node version ${version}` : ''}>
      <Spin spinning={loading} tip="Loading" fullscreen size='large' />
      <GridContent>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col >
            <StatisticCard
              bordered={true}
              boxShadow
              statistic={{
                title: 'Node Peer Id',
                loading: loading,
                value: nodeInfo?.peerId.substring(0, 10) + '...',
                description: <Paragraph copyable={{text:nodeInfo?.peerId ,tooltips: ['Copy', 'Copied'] }}><a href={`/node/${nodeInfo?.peerId}`}>detail</a></Paragraph>,
                valueStyle: { fontSize: 12 },
                icon: (<DeploymentUnitOutlined />)
              }}
            />
          </Col>
          <Col >
            <StatisticCard
              bordered={true}
              boxShadow
              statistic={{
                loading: loading,
                title: 'Node Owner',
                value: nodeInfo?.account.substring(0, 10) + '...',
                description:<Paragraph copyable={{text:nodeInfo?.account ,tooltips: ['Copy', 'Copied'] }}></Paragraph>,
                valueStyle: { fontSize: 11 },
                icon: (<InfoCircleOutlined />)
              }}
            />
          </Col>
          <Col >
            <StatisticCard
              bordered={true}
              boxShadow
              statistic={{
                loading: loading,
                title: 'Connected',
                status: 'success',
                value: cCount,
                description: "peers",
                icon: (<ApartmentOutlined />),
              }}
            />
          </Col>
          <Col >
            <StatisticCard
              bordered={true}
              boxShadow
              statistic={{
                loading: loading,
                title: 'Active',
                status: 'processing',
                value: activeNodes,
                description: "nodes",
                icon: (<RadarChartOutlined />),
              }}
            />
          </Col>
          <Col >
            <StatisticCard
              bordered={true}
              boxShadow
              statistic={{
                loading: loading,
                title: 'Stakes',
                status: 'processing',
                value: stakesCount,
                description: "nodes",
                icon: (<ApiOutlined />),
              }}
            />
          </Col>
          <Col >
            <StatisticCard
              bordered={true}
              boxShadow
              statistic={{
                loading: loading,
                title: 'Locked Supply',
                status: 'processing',
                value: locked,
                description: "CFLY",
                icon: (<DollarOutlined />),
              }}
            />
          </Col>
        </Row>
        <Divider orientation="left">Connected Peers</Divider>
        <Collapse items={peerItems} collapsible="icon" />
      </GridContent>
    </PageContainer>
  );
};

export default MainContent;

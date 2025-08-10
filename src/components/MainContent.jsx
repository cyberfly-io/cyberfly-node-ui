import { Col, Row, Divider, Typography, Collapse, Spin, Grid, Tag, Tooltip, Space } from 'antd';
import { GridContent, StatisticCard, PageContainer } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { getNodeInfo } from '../services/node-services';
import { ApartmentOutlined, InfoCircleOutlined, DeploymentUnitOutlined, RadarChartOutlined, DollarOutlined, ApiOutlined, EyeOutlined, PercentageOutlined } from '@ant-design/icons';
import { getActiveNodes, getAPY, getStakeStats } from '../services/pact-services';
import { getIPFromMultiAddr } from '../utils/utils';
import { useNavigate } from 'react-router-dom';

const { Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

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
  const navigate = useNavigate();
  const [apy, setApy] = useState(0);
  const screens = useBreakpoint();

  const short = (str, len = 12) => (!str ? '-' : (screens.xs ? `${str.slice(0, len)}...` : str));

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
      getAPY().then((data) => {
        setApy(data);
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
        label: (
          <Paragraph copyable={{ tooltips: ['Copy', 'Copied'] }} style={{ margin: 0 }}>
            {short(item.remotePeer, 18)}
          </Paragraph>
        ),
        children: (
          <Paragraph copyable={{ tooltips: ['Copy', 'Copied'] }}>
            <a rel="noreferrer" target="_blank" href={getIPFromMultiAddr(item.remoteAddr)}>
              {item.remoteAddr}
            </a>
          </Paragraph>
        ),
      }));
      setPeerItems(items);
    }
  }, [peers]);

  const cardCol = { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 };

  return (
    <PageContainer
      ghost
      loading={{ spinning: loading }}
      header={{
        title: 'Dashboard',
        extra: version ? [<Tag key="ver" color="blue">v{version}</Tag>] : [],
      }}
    >
      <Spin spinning={loading} tip="Loading" fullscreen size="large" />
      <GridContent>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }} align="stretch">
          <Col {...cardCol}>
            <StatisticCard
              bordered
              boxShadow
              statistic={{
                title: 'Node Peer Id',
                loading,
                value: short(nodeInfo?.peerId, 14),
                description: (
                  <Space size="small">
                    <Text type="secondary">Full:</Text>
                    <Paragraph
                      copyable={{ text: nodeInfo?.peerId, tooltips: ['Copy', 'Copied'] }}
                      style={{ display: 'inline-block', margin: 0 }}
                    >
                      {short(nodeInfo?.peerId, 20)}
                    </Paragraph>
                    <Tooltip title="View node">
                      <EyeOutlined
                        onClick={() => navigate(`/node/${nodeInfo?.peerId}`)}
                        style={{ cursor: 'pointer' }}
                      />
                    </Tooltip>
                  </Space>
                ),
                valueStyle: { fontSize: 12 },
                icon: <DeploymentUnitOutlined />,
              }}
            />
          </Col>

          <Col {...cardCol}>
            <StatisticCard
              bordered
              boxShadow
              statistic={{
                loading,
                title: 'Node Owner',
                value: short(nodeInfo?.account, 14),
                description: (
                  <Paragraph
                    copyable={{ text: nodeInfo?.account, tooltips: ['Copy', 'Copied'] }}
                    style={{ margin: 0 }}
                  >
                    {short(nodeInfo?.account, 20)}
                  </Paragraph>
                ),
                valueStyle: { fontSize: 11 },
                icon: <InfoCircleOutlined />,
              }}
            />
          </Col>

          <Col {...cardCol}>
            <StatisticCard
              bordered
              boxShadow
              statistic={{
                loading: cCount === 0 && loading,
                title: 'Connected',
                status: 'success',
                value: cCount,
                description: 'peers',
                icon: <ApartmentOutlined />,
              }}
            />
          </Col>

          <Col {...cardCol}>
            <StatisticCard
              bordered
              boxShadow
              statistic={{
                loading: activeNodes === 0 && loading,
                title: 'Active',
                status: 'processing',
                value: activeNodes,
                description: 'nodes',
                icon: <RadarChartOutlined />,
              }}
            />
          </Col>

          <Col {...cardCol}>
            <StatisticCard
              bordered
              boxShadow
              statistic={{
                loading: stakesCount === 0 && loading,
                title: 'Stakes',
                status: 'processing',
                value: stakesCount,
                description: 'nodes',
                icon: <ApiOutlined />,
              }}
            />
          </Col>

          <Col {...cardCol}>
            <StatisticCard
              bordered
              boxShadow
              statistic={{
                loading: locked === 0 && loading,
                title: 'Locked Supply',
                status: 'processing',
                value: locked,
                description: 'CFLY',
                icon: <DollarOutlined />,
              }}
            />
          </Col>

          <Col {...cardCol}>
            <StatisticCard
              bordered
              boxShadow
              statistic={{
                loading: apy === 0 && loading,
                title: 'APY',
                status: 'processing',
                value: apy,
                suffix: <PercentageOutlined />,
                icon: <PercentageOutlined />,
              }}
            />
          </Col>
        </Row>

        <Divider orientation="left">Connected Peers</Divider>
        <Collapse items={peerItems} collapsible="icon" size={screens.xs ? 'small' : 'middle'} />
      </GridContent>
    </PageContainer>
  );
};

export default MainContent;

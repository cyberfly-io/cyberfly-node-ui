
import React, { useState, useEffect } from 'react';
import { Map, Marker, Overlay } from "pigeon-maps"
import { PageContainer } from '@ant-design/pro-components';
import { getHost, getNodeInfo } from '../services/node-services';
import { Spin, Space, Card, Typography, Badge, Tooltip, Row, Col, Statistic, Tag, Button, Grid } from 'antd';
import { GlobalOutlined, EnvironmentOutlined, WifiOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { useDarkMode } from '../contexts/DarkModeContext';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const NodeMap = ()=>{
    const [ipData, setIpData] = useState([]);
    const [ipAddresses, setIpAddresses] = useState([]);
    const [loadingMarkers, setLoadingMarkers] = useState([]);
    const [visibleMarkers, setVisibleMarkers] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useDarkMode();
    const screens = useBreakpoint();
    // Get node connections
    useEffect(()=>{
        const getInfo = ()=>{
          getNodeInfo().then(data=>{
            const peers = data.connections
            let iparray = []
            peers.forEach(element => {
                iparray.push(element.remoteAddr.split('/')[2])
            });
            setIpAddresses(iparray);
          })
        }
       getInfo()
    },[])

    // Fetch IP location data one by one
    useEffect(() => {
        const fetchIpDataSequentially = async () => {
          const data = [];
          setLoadingMarkers(new Array(ipAddresses.length).fill(true));

          for (let i = 0; i < ipAddresses.length; i++) {
            try {
              const ip = ipAddresses[i];
              console.log(`Fetching location for IP: ${ip} (${i + 1}/${ipAddresses.length})`);

              // Use GraphQL query template to get IP location
              const query = `query MyQuery {
                getIPLocation(ip: "${ip}") {
                  lat
                  lon
                  query
                  country
                  city
                }
              }`;

              const response = await fetch('https://node.cyberfly.io/graphql', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  query: query,
                  operationName: "MyQuery"
                })
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const result = await response.json();

              if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                throw new Error(result.errors[0].message);
              }

              const locationData = result.data.getIPLocation;

              // Ensure we have valid coordinates
              const processedData = {
                ...locationData,
                lat: parseFloat(locationData.lat) || 0,
                lon: parseFloat(locationData.lon) || 0,
                ip: locationData.query || ip, // Use query field as IP, fallback to original IP
                city: locationData.city || 'Unknown',
                country: locationData.country || 'Unknown'
              };

              data.push(processedData);
              console.log(`Successfully loaded location for IP: ${ip}`, processedData);

              // Update loading state for this marker
              setLoadingMarkers(prev => {
                const newLoading = [...prev];
                newLoading[i] = false;
                return newLoading;
              });

              // Add to visible markers with animation delay
              setTimeout(() => {
                setVisibleMarkers(prev => [...prev, i]);
                console.log(`Marker ${i + 1} is now visible on map`);
              }, 300); // 300ms delay for smooth animation

              // Small delay between requests to avoid overwhelming the API
              if (i < ipAddresses.length - 1) {
                console.log(`Waiting 200ms before next request...`);
                await new Promise(resolve => setTimeout(resolve, 200));
              }

            } catch (error) {
              console.error(`Error fetching location for IP ${ipAddresses[i]}:`, error);

              // Add placeholder data for errors
              const errorData = {
                query: ipAddresses[i],
                lat: 0,
                lon: 0,
                city: 'Unknown',
                country: 'Unknown',
                error: true
              };

              data.push(errorData);

              setLoadingMarkers(prev => {
                const newLoading = [...prev];
                newLoading[i] = false;
                return newLoading;
              });

              // Still show error markers on map
              setTimeout(() => {
                setVisibleMarkers(prev => [...prev, i]);
              }, 300);
            }
          }

          setIpData(data);
          setLoading(false);
          console.log(`Completed loading ${data.length} IP locations`);
        };

        if (ipAddresses.length > 0) {
          console.log(`Starting to load ${ipAddresses.length} IP locations sequentially`);
          fetchIpDataSequentially();
        } else {
          setLoading(false);
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [ipAddresses]);

    // Animate markers appearing one by one (no longer needed - handled in fetch function)
    // const startMarkerAnimation = (data) => {
    //   setLoadingMarkers(new Array(data.length).fill(true));
    //
    //   data.forEach((_, index) => {
    //     setTimeout(() => {
    //       setVisibleMarkers(prev => [...prev, index]);
    //       setLoadingMarkers(prev => {
    //         const newLoading = [...prev];
    //         newLoading[index] = false;
    //         return newLoading;
    //       });
    //     }, index * 500); // 500ms delay between each marker
    //   });
    // };

    // Custom marker component
    const CustomMarker = ({ data, index, isVisible }) => {
      if (!isVisible) return null;

      const isError = data.error || (!data.lat && !data.lon);
      const borderColor = isError ? '#ff4d4f' : (isDarkMode ? '#1890ff' : '#1890ff');
      const backgroundColor = isError ? '#fff2f0' : (isDarkMode ? '#1a1a1a' : '#ffffff');

      return (
        <Marker
          key={index}
          anchor={[data.lat || 0, data.lon || 0]}
          onClick={() => setSelectedNode(data)}
        >
          <div style={{
            background: backgroundColor,
            border: `2px solid ${borderColor}`,
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transform: 'translate(-50%, -50%)',
            animation: 'bounceIn 0.5s ease-out'
          }}>
            <NodeIndexOutlined
              style={{
                color: borderColor,
                fontSize: '16px'
              }}
            />
            {isError && (
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '12px',
                height: '12px',
                background: '#ff4d4f',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            )}
          </div>
        </Marker>
      );
    };

    return(
   <PageContainer
     title={
       <Space>
         <GlobalOutlined />
         <span>Node Explorer</span>
       </Space>
     }
     subTitle="Interactive world map of CyberFly network nodes"
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
     <Space direction="vertical" size="large" style={{ width: '100%' }}>
       {/* Statistics Dashboard */}
       <Row gutter={[24, 24]}>
         <Col xs={24} sm={12} lg={6}>
           <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
             <Statistic
               title="Total Nodes"
               value={ipData.length}
               prefix={<NodeIndexOutlined />}
               valueStyle={{ color: '#1890ff' }}
             />
           </Card>
         </Col>
         <Col xs={24} sm={12} lg={6}>
           <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
             <Statistic
               title="Active Markers"
               value={visibleMarkers.length}
               prefix={<EnvironmentOutlined />}
               valueStyle={{ color: '#52c41a' }}
             />
           </Card>
         </Col>
         <Col xs={24} sm={12} lg={6}>
           <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
             <Statistic
               title="Loading Progress"
               value={Math.round(((ipAddresses.length - loadingMarkers.filter(Boolean).length) / Math.max(ipAddresses.length, 1)) * 100)}
               suffix="%"
               prefix={<WifiOutlined />}
               valueStyle={{ color: '#fa8c16' }}
             />
           </Card>
         </Col>
         <Col xs={24} sm={12} lg={6}>
           <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
             <Statistic
               title="Current Status"
               value={loading ? `Loading ${visibleMarkers.length + 1}/${ipAddresses.length}` : 'Complete'}
               prefix={<WifiOutlined />}
               valueStyle={{ color: loading ? '#fa8c16' : '#52c41a' }}
             />
           </Card>
         </Col>
       </Row>

       {/* Map Container */}
       <Card
         bordered={false}
         style={{
           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
           position: 'relative'
         }}
       >
         <div style={{
           position: 'relative',
           height: screens.xs ? '400px' : screens.sm ? '500px' : '600px',
           width: '100%',
           borderRadius: '8px',
           overflow: 'hidden'
         }}>
           <Spin spinning={loading} tip={`Loading node locations... ${visibleMarkers.length}/${ipAddresses.length} loaded`} size="large">
             <Map
               height={600}
               defaultCenter={[20, 0]}
               defaultZoom={2}
               maxZoom={10}
               minZoom={1}
               animate={true}
               attribution={false}
             >
               {ipData.map((data, index) => (
                 <CustomMarker
                   key={index}
                   data={data}
                   index={index}
                   isVisible={visibleMarkers.includes(index)}
                 />
               ))}

               {/* Selected Node Overlay */}
               {selectedNode && (
                 <Overlay anchor={[selectedNode.lat, selectedNode.lon]} offset={[0, -50]}>
                   <Card
                     size="small"
                     style={{
                       boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                       border: 'none',
                       background: isDarkMode ? '#1a1a1a' : '#ffffff',
                       minWidth: '200px'
                     }}
                   >
                     <Space direction="vertical" size="small">
                       <Title level={5} style={{ margin: 0, color: isDarkMode ? '#e0e0e0' : undefined }}>
                         Node Information
                       </Title>
                       <div>
                         <Text strong style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>IP:</Text>
                         <Text code copyable style={{ marginLeft: 8 }}>
                           {selectedNode.query || selectedNode.ip}
                         </Text>
                       </div>
                       <div>
                         <Text strong style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>Location:</Text>
                         <Text style={{ marginLeft: 8 }}>
                           {selectedNode.city}, {selectedNode.country}
                         </Text>
                       </div>
                       <div>
                         <Text strong style={{ color: isDarkMode ? '#e0e0e0' : undefined }}>Coordinates:</Text>
                         <Text style={{ marginLeft: 8, fontFamily: 'monospace' }}>
                           {selectedNode.lat.toFixed(4)}, {selectedNode.lon.toFixed(4)}
                         </Text>
                       </div>
                       <Button
                         size="small"
                         onClick={() => setSelectedNode(null)}
                         style={{ marginTop: 8 }}
                       >
                         Close
                       </Button>
                     </Space>
                   </Card>
                 </Overlay>
               )}
             </Map>
           </Spin>
         </div>
       </Card>

       {/* Node List */}
       {ipData.length > 0 && (
         <Card
           title={
             <Space>
               <NodeIndexOutlined />
               <span>Connected Nodes ({ipData.length})</span>
             </Space>
           }
           bordered={false}
           style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
         >
           <Row gutter={[16, 16]}>
             {ipData.map((node, index) => (
               <Col xs={24} sm={12} md={8} lg={6} key={index}>
                 <Card
                   size="small"
                   hoverable
                   onClick={() => setSelectedNode(node)}
                   style={{
                     cursor: 'pointer',
                     background: visibleMarkers.includes(index)
                       ? (isDarkMode ? '#1a1a1a' : '#ffffff')
                       : (isDarkMode ? '#141414' : '#fafafa'),
                     border: visibleMarkers.includes(index)
                       ? (node.error ? '1px solid #ff4d4f' : '1px solid #1890ff')
                       : '1px solid #d9d9d9',
                     transition: 'all 0.3s ease'
                   }}
                 >
                   <Space direction="vertical" size="small" style={{ width: '100%' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Text strong style={{ fontSize: '12px' }}>
                         Node {index + 1}
                       </Text>
                       {node.error ? (
                         <Badge status="error" text="Error" />
                       ) : visibleMarkers.includes(index) ? (
                         <Badge status="success" text="Active" />
                       ) : (
                         <Badge status="processing" text="Loading" />
                       )}
                     </div>
                     <Text code style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                       {node.query || node.ip}
                     </Text>
                     <Text type="secondary" style={{ fontSize: '11px' }}>
                       {node.city && node.country ? `${node.city}, ${node.country}` : 'Location unavailable'}
                     </Text>
                     {node.error && (
                       <Text type="danger" style={{ fontSize: '10px' }}>
                         Failed to load location
                       </Text>
                     )}
                   </Space>
                 </Card>
               </Col>
             ))}
           </Row>
         </Card>
       )}
     </Space>

     <style jsx>{`
       @keyframes bounceIn {
         0% {
           transform: translate(-50%, -50%) scale(0.3);
           opacity: 0;
         }
         50% {
           transform: translate(-50%, -50%) scale(1.05);
         }
         70% {
           transform: translate(-50%, -50%) scale(0.9);
         }
         100% {
           transform: translate(-50%, -50%) scale(1);
           opacity: 1;
         }
       }
     `}</style>
   </PageContainer>
)
}


export default NodeMap;
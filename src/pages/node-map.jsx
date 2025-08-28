
import React, { useState, useEffect } from 'react';
import { Map, Marker } from "pigeon-maps"
import { PageContainer } from '@ant-design/pro-components';
import { getHost, getNodeInfo } from '../services/node-services';
import { Spin, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useDarkMode } from '../contexts/DarkModeContext';

const NodeMap = ()=>{
    const [ipData, setIpData] = useState([]);
    const [ipAddresses, setIpAddresses] = useState([]);
    const protocol = window.location.protocol; // Get the current protocol
    const [loading, setLoading] = useState(true);

    const host = getHost()
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
    
    useEffect(() => {
        const fetchIpData = async () => {
          const ipDataPromises = ipAddresses.map(async (ip) => {
            const url = `${protocol}//${host}/api/location/${ip}`;
            const response = await fetch(url, {headers:{ 'Accept': 'application/json',
            'Content-Type': 'application/json'}});
            return await response.json();
          });
          const data = await Promise.all(ipDataPromises);
          setIpData(data);
          if(data.length>0){
            setLoading(false);
          }
        };
        fetchIpData()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [ipAddresses]);
return(
   <PageContainer 
     title={
       <Space>
         <GlobalOutlined />
         <span>Node Map</span>
       </Space>
     }
     subTitle="Visualize network nodes on a global map"
     header={{
       style: { padding: '16px 0' }
     }}
   >
         <Spin spinning={loading} tip="Loading" fullscreen size='large'/>

    <Map height={550} width={1000} defaultCenter={[50.879, 4.6997]} defaultZoom={2}>
    {ipData.map((data, index) => (
        <Marker
          key={index}
          anchor={[data.lat, data.lon]}
        >
            {data.ip}
        </Marker>
      ))}
    </Map>

   </PageContainer>
)
}


export default NodeMap;